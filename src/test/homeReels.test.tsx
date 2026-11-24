import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AdminReels from '@/pages/admin/AdminReels';
import ReelsSection from '@/components/home/ReelsSection';
import { parseHomeReels, reelPlayback } from '@/lib/homeReels';

const settings = vi.hoisted(() => ({ value: '', save: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/hooks/useSiteSettings', () => ({
  useSiteSettings: () => ({ getSetting: () => settings.value, updateSetting: settings.save }),
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en' }) }));
vi.mock('@/hooks/useProducts', () => ({
  useProductOptions: () => ({ data: [{ id: 'product-id', slug: 'demo-product', name: 'Demo product' }] }),
}));
vi.mock('@/components/admin/AdminLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
afterEach(() => { cleanup(); settings.value = ''; settings.save.mockClear(); });

it('accepts supported video links and rejects incorrect providers or protocols', () => {
  expect(reelPlayback('youtube', 'https://youtube.com/shorts/AbcDe0123_-')).toEqual({
    kind: 'embed', url: 'https://www.youtube-nocookie.com/embed/AbcDe0123_-?autoplay=1&rel=0&controls=0&playsinline=1',
  });
  expect(reelPlayback('facebook', 'https://www.facebook.com/reel/12345')?.url).toContain('facebook.com/plugins/video.php');
  expect(reelPlayback('facebook', 'https://fb.watch/abc/')?.kind).toBe('external');
  expect(reelPlayback('drive', 'https://drive.google.com/file/d/file-id/view?resourcekey=key')?.url).toBe('https://drive.google.com/file/d/file-id/preview?resourcekey=key');
  expect(reelPlayback('mp4', 'https://example.com/video.mp4?x=1')?.kind).toBe('video');
  expect(reelPlayback('youtube', 'https://youtube.com.example.test/watch?v=AbcDe0123_-')).toBeNull();
  expect(reelPlayback('mp4', 'javascript:video.mp4')).toBeNull();
  expect(reelPlayback('mp4', '//example.test/video.mp4')).toBeNull();
  expect(parseHomeReels('{"invalid":"not-an-array"}')).toEqual([]);
});

it('asks for the source first and saves the selected source with the video URL', async () => {
  render(<AdminReels />);
  fireEvent.click(screen.getByRole('button', { name: 'রিল যোগ করুন' }));
  expect(screen.getByLabelText('ভিডিও লিংক')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('ভিডিওর উৎস'), { target: { value: 'mp4' } });
  fireEvent.change(screen.getByLabelText('ভিডিও লিংক'), { target: { value: 'https://example.test/demo.mp4' } });
  fireEvent.change(screen.getByLabelText('শিরোনাম'), { target: { value: 'Demo reel' } });
  fireEvent.click(screen.getByRole('button', { name: 'রিলস সেভ করুন' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('তালিকা থেকে একটি পণ্য বেছে নিন');
  fireEvent.change(screen.getByLabelText('রিলের পণ্য'), { target: { value: 'demo-product' } });
  fireEvent.click(screen.getByRole('button', { name: 'রিলস সেভ করুন' }));
  await waitFor(() => expect(settings.save).toHaveBeenCalledOnce());
  const [key, raw] = settings.save.mock.calls[0];
  expect(key).toBe('home_reels');
  expect(parseHomeReels(raw)).toEqual([expect.objectContaining({ title: 'Demo reel', source: 'mp4', productSlug: 'demo-product', url: 'https://example.test/demo.mp4' })]);
});

it('loads an embedded player only after the visitor chooses a reel', async () => {
  settings.value = JSON.stringify([{ id: 'sample', source: 'youtube', url: 'https://youtu.be/AbcDe0123_-', title: 'Video preview', cover: '' }]);
  render(<MemoryRouter><ReelsSection /></MemoryRouter>);
  expect(screen.queryByTitle('Video preview')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Play Video preview' }));
  expect(await screen.findByTitle('Video preview')).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/AbcDe0123_-'));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByTitle('Video preview')).not.toBeInTheDocument());
});

it('keeps the player clean and navigates between reels with arrow keys', async () => {
  settings.value = JSON.stringify([
    { id: 'a', title: 'First reel', source: 'mp4', url: 'https://example.test/a.mp4', cover: '' },
    { id: 'b', title: 'Second reel', source: 'mp4', url: 'https://example.test/b.mp4', cover: '' },
  ]);
  render(<MemoryRouter><ReelsSection /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Play First reel' }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog.querySelector('video')).toHaveAttribute('src', 'https://example.test/a.mp4');
  expect(dialog.querySelector('video')).not.toHaveAttribute('controls');
  expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/shop');
  expect(screen.getByRole('button', { name: 'অর্ডার করুন' })).toBeDisabled();
  expect(dialog.querySelector('h2')).toHaveClass('sr-only');
  fireEvent.keyDown(dialog, { key: 'ArrowRight' });
  expect(dialog.querySelector('video')).toHaveAttribute('src', 'https://example.test/b.mp4');
  fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
  expect(dialog.querySelector('video')).toHaveAttribute('src', 'https://example.test/a.mp4');
});


it('opens the shop and routes orders to the linked product', async () => {
  settings.value = JSON.stringify([{ id: 'linked', source: 'mp4', url: 'https://example.test/demo.mp4', title: 'Linked reel', cover: '', productSlug: 'demo-product' }]);
  render(<MemoryRouter><ReelsSection /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Play Linked reel' }));
  expect(await screen.findByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/shop');
  expect(screen.getByRole('link', { name: 'অর্ডার করুন' })).toHaveAttribute('href', '/product/demo-product');
});

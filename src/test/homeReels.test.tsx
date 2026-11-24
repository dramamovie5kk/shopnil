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
vi.mock('@/components/admin/AdminLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
afterEach(() => { cleanup(); settings.value = ''; settings.save.mockClear(); });

it('accepts supported video links and rejects incorrect providers or protocols', () => {
  expect(reelPlayback('youtube', 'https://youtube.com/shorts/AbcDe0123_-')).toEqual({
    kind: 'embed', url: 'https://www.youtube-nocookie.com/embed/AbcDe0123_-?autoplay=1&rel=0',
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
  await waitFor(() => expect(settings.save).toHaveBeenCalledOnce());
  const [key, raw] = settings.save.mock.calls[0];
  expect(key).toBe('home_reels');
  expect(parseHomeReels(raw)).toEqual([expect.objectContaining({ title: 'Demo reel', source: 'mp4', url: 'https://example.test/demo.mp4' })]);
});

it('loads an embedded player only after the visitor chooses a reel', async () => {
  settings.value = JSON.stringify([{ id: 'sample', source: 'youtube', url: 'https://youtu.be/AbcDe0123_-', title: 'Video preview', cover: '' }]);
  render(<ReelsSection />);
  expect(screen.queryByTitle('Video preview')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Play Video preview' }));
  expect(await screen.findByTitle('Video preview')).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/AbcDe0123_-'));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByTitle('Video preview')).not.toBeInTheDocument());
});

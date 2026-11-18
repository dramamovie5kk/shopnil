import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import HomePage from '@/pages/HomePage';
import SiteModeSettings from '@/components/admin/SiteModeSettings';

const settings = vi.hoisted(() => ({ mode: '', loading: false }));
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ isLoading: settings.loading, getSetting: (key: string) => key === 'site_mode' ? settings.mode : 'old-pinned-sales-page' }) }));
vi.mock('@/pages/HomeSalesPage', () => ({ default: () => <h1>Sales page catalog</h1> }));
vi.mock('@/pages/WebsiteHome', () => ({ default: () => <h1>Product and category storefront</h1> }));

beforeEach(() => { cleanup(); settings.mode = ''; settings.loading = false; });
describe('homepage mode switching', () => {
  it('keeps existing sites on the sales-page catalog when no mode is saved', async () => {
    render(<HomePage />);
    expect(await screen.findByText('Sales page catalog')).toBeInTheDocument();
  });
  it('waits for saved settings rather than briefly showing the wrong homepage', () => {
    settings.loading = true; settings.mode = 'website'; render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
  it('switches both ways without letting a legacy pinned landing page override the mode', async () => {
    settings.mode = 'website'; const { rerender } = render(<HomePage />);
    expect(await screen.findByText('Product and category storefront')).toBeInTheDocument();
    expect(screen.queryByText('Sales page catalog')).not.toBeInTheDocument();
    settings.mode = 'landing'; rerender(<HomePage />);
    expect(await screen.findByText('Sales page catalog')).toBeInTheDocument();
    expect(screen.queryByText('Product and category storefront')).not.toBeInTheDocument();
    settings.mode = 'website'; rerender(<HomePage />);
    expect(await screen.findByText('Product and category storefront')).toBeInTheDocument();
  });
  it('uses the landing catalog for an unrecognized saved mode', async () => {
    settings.mode = 'invalid'; render(<HomePage />);
    expect(await screen.findByText('Sales page catalog')).toBeInTheDocument();
  });
  it('provides the exact persisted mode when an administrator selects either option', () => {
    const onChange = vi.fn(); const { rerender } = render(<SiteModeSettings value="landing" onChange={onChange} />);
    const radios = screen.getAllByRole('radio'); expect(radios[0]).toBeChecked();
    fireEvent.click(radios[1]); expect(onChange).toHaveBeenLastCalledWith('website');
    rerender(<SiteModeSettings value="website" onChange={onChange} />);
    expect(radios[1]).toBeChecked(); fireEvent.click(radios[0]); expect(onChange).toHaveBeenLastCalledWith('landing');
  });
});

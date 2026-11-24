import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { HeaderMarquee } from '@/components/layout/HeaderMarquee';

afterEach(cleanup);

it('shows each announcement and pauses or resumes the scrolling track', () => {
  const { container } = render(<HeaderMarquee device="mobile" bn={false} duration="2" messages={'First offer|Second offer\nThird offer'} />);
  const track = container.querySelector('.header-marquee-track');
  expect(track).toHaveStyle('--header-marquee-duration: 10s');
  expect(track?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  for (const text of ['First offer', 'Second offer', 'Third offer']) expect(screen.getAllByText(text)).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Pause announcements' }));
  expect(track).toHaveAttribute('data-paused', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Play announcements' }));
  expect(track).toHaveAttribute('data-paused', 'false');
});

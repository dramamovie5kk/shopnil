import { describe, expect, it } from 'vitest';
import { customDesktopLayoutStyle } from '@/lib/customSectionElements';

describe('custom section desktop geometry', () => {
  it('resolves independently entered image/video width and side padding', () => {
    expect(customDesktopLayoutStyle({ desktopWidth: '60', desktopPaddingLeft: '20', desktopPaddingRight: '40' })).toEqual({
      '--custom-desktop-width': '60%', '--custom-desktop-max-width': 'none',
      '--custom-desktop-padding-left': '20px', '--custom-desktop-padding-right': '40px',
    });
  });
  it('keeps explicit zero gaps and full width available', () => {
    expect(customDesktopLayoutStyle({ desktopWidth: '100', desktopPaddingLeft: '0', desktopPaddingRight: '0' })).toMatchObject({
      '--custom-desktop-width': '100%', '--custom-desktop-padding-left': '0px', '--custom-desktop-padding-right': '0px',
    });
  });
  it('resolves per-button width without forcing media gaps', () => {
    expect(customDesktopLayoutStyle({ desktopWidth: '30' })).toMatchObject({
      '--custom-desktop-width': '30%', '--custom-desktop-padding-left': undefined, '--custom-desktop-padding-right': undefined,
    });
  });
  it('treats blank and invalid inputs as unset, not zero', () => {
    expect(customDesktopLayoutStyle({ desktopWidth: '', desktopPaddingLeft: 'invalid', desktopPaddingRight: ' ' })).toEqual(customDesktopLayoutStyle());
  });
});
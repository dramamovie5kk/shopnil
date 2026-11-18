import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { useCarouselPause } from '@/hooks/useCarouselPause';
import type { EmblaCarouselType } from 'embla-carousel';
afterEach(cleanup);
function setup(enabled = true) {
  const autoplay={stop:vi.fn(),play:vi.fn(),isPlaying:vi.fn(()=>false)};
  const api={plugins:()=>({autoplay}),on:vi.fn().mockReturnThis(),off:vi.fn().mockReturnThis()} as unknown as EmblaCarouselType;
  function Harness(){const ref=useCarouselPause(api,enabled);return <section ref={ref} data-testid="banner" />;}
  const result=render(<Harness />);
  return {...result,autoplay,root:result.getByTestId('banner')};
}
function pointer(target: EventTarget,type: string,pointerType: string,pointerId=1){const e=new Event(type);Object.assign(e,{pointerType,pointerId});target.dispatchEvent(e);}
describe('banner autoplay pause',()=>{
  it('reveals controls without enabling disabled autoplay',()=>{
    const {root,autoplay}=setup(false);pointer(root,'pointerenter','mouse');
    expect(root).toHaveAttribute('data-banner-hovered');expect(autoplay.stop).not.toHaveBeenCalled();
    pointer(root,'pointerleave','mouse');expect(root).not.toHaveAttribute('data-banner-hovered');expect(autoplay.play).not.toHaveBeenCalled();
  });
  it('stays paused if the mouse leaves while a pointer is still held outside',()=>{
    const {root,autoplay}=setup();
    pointer(root,'pointerenter','mouse');pointer(root,'pointerdown','mouse');pointer(root,'pointerleave','mouse');
    expect(autoplay.stop).toHaveBeenCalled();expect(autoplay.play).not.toHaveBeenCalled();
    pointer(window,'pointerup','mouse');expect(autoplay.play).toHaveBeenCalledOnce();
  });
  it('waits until all touch points end and resumes after cancellation',()=>{
    const {root,autoplay}=setup();
    pointer(root,'pointerenter','touch');expect(autoplay.stop).not.toHaveBeenCalled();
    pointer(root,'pointerdown','touch',1);pointer(root,'pointerdown','touch',2);
    pointer(window,'pointerup','touch',1);expect(autoplay.play).not.toHaveBeenCalled();
    pointer(window,'pointercancel','touch',2);expect(autoplay.play).toHaveBeenCalledOnce();
  });
  it('does not resume after release while still hovered and removes listeners on unmount',()=>{
    const {root,autoplay,unmount}=setup();pointer(root,'pointerenter','mouse');pointer(root,'pointerdown','mouse');pointer(window,'pointerup','mouse');
    expect(autoplay.play).not.toHaveBeenCalled();pointer(root,'pointerleave','mouse');expect(autoplay.play).toHaveBeenCalledOnce();
    unmount();pointer(window,'pointerup','mouse');expect(autoplay.play).toHaveBeenCalledOnce();
  });
});

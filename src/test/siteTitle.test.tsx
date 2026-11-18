import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DynamicTitle from '@/components/DynamicTitle';
const state=vi.hoisted(()=>({name:'Baridhara',loading:false}));
vi.mock('@/hooks/useSiteSettings',()=>({useSiteSettings:()=>({settings:[],isLoading:state.loading,getSetting:(key:string,fallback='')=>key==='site_name'?state.name:key==='browser_tab_title'?'ZC Plus':fallback})}));
afterEach(()=>{cleanup();state.name='Baridhara';state.loading=false;});
describe('site title',()=>{
  it('keeps the server-rendered name while settings load',()=>{
    document.title='Server shop';state.loading=true;const {rerender}=render(<DynamicTitle />);expect(document.title).toBe('Server shop');
    state.loading=false;rerender(<DynamicTitle />);expect(document.title).toBe('Baridhara');
  });
  it('uses only the site name and follows saved name changes',()=>{
    const {rerender}=render(<DynamicTitle />);expect(document.title).toBe('Baridhara');
    state.name='নতুন দোকান';rerender(<DynamicTitle />);expect(document.title).toBe('নতুন দোকান');
  });
});

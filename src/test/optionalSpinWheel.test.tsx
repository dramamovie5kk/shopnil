import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import OptionalSpinWheel from '@/components/spin/OptionalSpinWheel';
const state=vi.hoisted(()=>({enabled:'false',loading:false}));
vi.mock('@/hooks/useSiteSettings',()=>({useSiteSettings:()=>({isLoading:state.loading,getSetting:()=>state.enabled})}));
vi.mock('@/components/spin/SpinWheel',()=>({default:()=> <div>Spin offer loaded</div>}));
afterEach(()=>{cleanup();state.enabled='false';state.loading=false;});
describe('optional spin loading',()=>{
  it('keeps disabled offers out of the page',()=>{render(<MemoryRouter><OptionalSpinWheel/></MemoryRouter>);expect(screen.queryByText('Spin offer loaded')).toBeNull();});
  it('keeps offers off checkout even when enabled',()=>{state.enabled='true';render(<MemoryRouter initialEntries={['/checkout']}><OptionalSpinWheel/></MemoryRouter>);expect(screen.queryByText('Spin offer loaded')).toBeNull();});
  it('loads an enabled storefront offer',async()=>{state.enabled='true';render(<MemoryRouter><OptionalSpinWheel/></MemoryRouter>);expect(await screen.findByText('Spin offer loaded')).toBeInTheDocument();});
});

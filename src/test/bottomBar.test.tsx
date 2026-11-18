import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import BottomBarSettings from '@/components/admin/BottomBarSettings';
import FooterPayments from '@/components/layout/FooterPayments';
import { bottomBarDefaults, bottomLink, bottomWhatsapp } from '@/lib/bottomBarSettings';
const state=vi.hoisted(()=>({values:{} as Record<string,string>}));
vi.mock('@/hooks/useSiteSettings',()=>({useSiteSettings:()=>({getSetting:(key:string,fallback='')=>state.values[key]||fallback})}));
afterEach(()=>{cleanup();state.values={};});
describe('mobile bottom bar',()=>{
 it('renders five items with configurable labels, links and WhatsApp number',()=>{
  state.values={bottom_nav_home_label:'প্রথম পাতা',bottom_nav_shop_link:'/shop',bottom_nav_whatsapp_number:'01712345678'};
  render(<MemoryRouter><MobileBottomNav/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'প্রথম পাতা'})).toHaveAttribute('href','/');
  expect(screen.getByRole('link',{name:'শপ'})).toHaveAttribute('href','/shop');
  expect(screen.getByRole('link',{name:'হোয়াটসঅ্যাপ'})).toHaveAttribute('href','https://wa.me/8801712345678');
  expect(screen.getAllByRole('link')).toHaveLength(5);
 });
 it('prefers a saved WhatsApp link over the general site number',()=>{
  state.values={bottom_nav_whatsapp_link:'https://wa.me/8801812345678',whatsapp_number:'01712345678'};
  render(<MemoryRouter><MobileBottomNav/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'হোয়াটসঅ্যাপ'})).toHaveAttribute('href','https://wa.me/8801812345678');
 });
 it('hides on checkout and honors the global toggle',()=>{
  const view=render(<MemoryRouter initialEntries={['/checkout']}><MobileBottomNav/></MemoryRouter>);expect(screen.queryByRole('navigation')).toBeNull();view.unmount();
  state.values.bottom_nav_enabled='false';render(<MemoryRouter><MobileBottomNav/></MemoryRouter>);expect(screen.queryByRole('navigation')).toBeNull();
 });
 it('rejects unsafe links and placeholder WhatsApp accounts',()=>{
  expect(bottomLink('javascript:alert(1)','/')).toBe('/');expect(bottomLink('//bad.example','/')).toBe('/');
  expect(bottomWhatsapp('','https://wa.me/8801XXXXXXXXX','')).toBeUndefined();
  expect(bottomWhatsapp('01712345678','','হ্যালো')).toContain('text=');
 });
 it('edits links and numbers through the bottom settings tab component',()=>{
  const change=vi.fn();render(<BottomBarSettings values={{...bottomBarDefaults}} onChange={change}/>);
  fireEvent.change(screen.getByLabelText('WhatsApp নম্বর'),{target:{value:'01712345678'}});expect(change).toHaveBeenCalledWith('bottom_nav_whatsapp_number','01712345678');
  fireEvent.change(screen.getByLabelText('শপ বাটনের লিংক'),{target:{value:'/shop'}});expect(change).toHaveBeenCalledWith('bottom_nav_shop_link','/shop');
 });
 it('shows only the four requested payment methods in one nonwrapping row',()=>{
  render(<FooterPayments/>);expect(screen.getAllByRole('listitem')).toHaveLength(4);expect(screen.getByRole('list')).toHaveClass('flex-nowrap');
  expect(screen.getByLabelText('বিকাশ')).toBeInTheDocument();expect(screen.getByLabelText('ক্যাশ অন ডেলিভারি')).toBeInTheDocument();
 });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ProductMedia from '@/components/product/ProductMedia';
const mock=vi.hoisted(()=>{
  const state={index:0,handlers:{} as Record<string,()=>void>};
  const api={selectedScrollSnap:()=>state.index,on:(event:string,callback:()=>void)=>{state.handlers[event]=callback;return api;},off:(event:string)=>{delete state.handlers[event];return api;},scrollTo:vi.fn((index:number)=>{state.index=index;state.handlers.select?.();}),scrollPrev:vi.fn(),scrollNext:vi.fn()};return {state,api};
});
vi.mock('embla-carousel-react',()=>({default:()=>[undefined,mock.api]}));
beforeEach(()=>{mock.state.index=0;mock.state.handlers={};vi.clearAllMocks();});
afterEach(cleanup);
describe('product image and video gallery',()=>{
  it('does not repeat the primary image in the thumbnails',()=>{
    render(<ProductMedia imageUrl="https://example.com/one.png" images={['https://example.com/one.png','https://example.com/two.png']} videoUrl={null}/>);
    expect(screen.getAllByRole('button',{name:/প্রোডাক্টের ছবি \d/})).toHaveLength(2);
    fireEvent.click(screen.getByRole('button',{name:'প্রোডাক্টের ছবি 2'}));
    expect(mock.api.scrollTo).toHaveBeenCalledWith(1);expect(screen.getByRole('button',{name:'প্রোডাক্টের ছবি 2'})).toHaveAttribute('aria-pressed','true');
  });
  it('loads video only when selected and stops it when changing back to an image',()=>{
    render(<ProductMedia imageUrl="https://example.com/one.png" videoUrl="https://www.youtube.com/watch?feature=shared&v=abcdefghijk"/>);
    expect(screen.queryByTitle('Product video')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'প্রোডাক্টের ছবি 2'}));
    expect(screen.getByTitle('Product video')).toHaveAttribute('src','https://www.youtube.com/embed/abcdefghijk?autoplay=0');
    fireEvent.click(screen.getByRole('button',{name:'প্রোডাক্টের ছবি 1'}));expect(screen.queryByTitle('Product video')).not.toBeInTheDocument();
  });
  it('keeps a usable placeholder for a product without images',()=>{
    render(<ProductMedia imageUrl={null} videoUrl={null}/>);expect(screen.getByText('📦')).toBeInTheDocument();expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

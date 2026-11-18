import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productPageDefaults, safeProductLink, selectedRelatedIds, productNumber } from '@/lib/productPageSettings';
import ProductPageSettings from '@/components/admin/ProductPageSettings';
vi.mock('@/hooks/useProducts',()=>({useProducts:()=>({data:[{id:'a',name:'Apple',name_bn:'আপেল'},{id:'b',name:'Honey',name_bn:'মধু'}]})}));
afterEach(cleanup);
describe('product page customization',()=>{
  it('only accepts safe navigation links',()=>{
    for(const value of ['javascript:alert(1)','//evil.test','/\\evil.test','https://example.com\n/path','data:text/html,test'])expect(safeProductLink(value)).toBeUndefined();
    expect(safeProductLink('/checkout')).toBe('/checkout');
    expect(safeProductLink('https://example.com/order')).toBe('https://example.com/order');
    expect(safeProductLink('tel:+8801711111111')).toBeUndefined();
    expect(safeProductLink('tel:+8801711111111',true)).toBe('tel:+8801711111111');
  });
  it('deduplicates selected products while preserving order and bounds numeric settings',()=>{
    expect(selectedRelatedIds(' b,a,b, ,c ')).toEqual(['b','a','c']);
    expect(productNumber('900',1,12,4)).toBe(12);
    expect(productNumber('',1,12,4)).toBe(4);
    expect(productNumber('NaN',1,12,4)).toBe(4);
  });
  it('edits section visibility, contact copy and manual product order independently',()=>{
    function Harness(){const [values,setValues]=useState<Record<string,string>>({...productPageDefaults,product_related_mode:'manual'});return <MemoryRouter><ProductPageSettings values={values} onChange={(key,value)=>setValues(prev=>({...prev,[key]:value}))}/><output data-testid="values">{JSON.stringify(values)}</output></MemoryRouter>;}
    render(<Harness/>);
    fireEvent.click(screen.getByRole('switch',{name:'সোশ্যাল অংশ দেখাবে'}));
    fireEvent.change(document.getElementById('product_call_phone')!,{target:{value:'+8801700000000'}});
    fireEvent.click(screen.getByRole('checkbox',{name:'বাছাই আপেল'}));
    fireEvent.click(screen.getByRole('checkbox',{name:'বাছাই মধু'}));
    fireEvent.click(screen.getAllByRole('button',{name:'প্রোডাক্ট আগে নিন'})[1]);
    const values=JSON.parse(screen.getByTestId('values').textContent!);
    expect(values.product_related_ids).toBe('b,a');expect(values.product_social_enabled).toBe('false');
    expect(values.product_call_phone).toBe('+8801700000000');expect(values.product_description_enabled).toBe('true');
  });
});

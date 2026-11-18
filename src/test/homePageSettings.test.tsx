import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HomePageSettings from '@/components/admin/HomePageSettings';
import { homePageDefaults, homeSectionEnabled, homeNumber, homeColor } from '@/lib/homePageSettings';
afterEach(cleanup);
describe('home page settings',()=>{
  it('keeps existing sections visible and understands previous saved toggle values',()=>{
    expect(homeSectionEnabled('true')).toBe(true);expect(homeSectionEnabled('')).toBe(true);
    expect(homeSectionEnabled('false')).toBe(false);expect(homeSectionEnabled('0')).toBe(false);
  });
  it('bounds grid counts and rejects unsafe colors',()=>{
    expect(homeNumber('500',1,60,12)).toBe(60);expect(homeNumber('bad',1,60,12)).toBe(12);
    expect(homeNumber('',1,60,12)).toBe(12);expect(homeColor('url(evil)')).toBeUndefined();
    expect(homeColor('#123456')).toBe('#123456');
  });
  it('allows toggling categories and editing products without changing the other section',()=>{
    function Harness(){const [values,setValues]=useState(homePageDefaults);return <><HomePageSettings values={values} onChange={(key,value)=>setValues(prev=>({...prev,[key]:value}))}/><output data-testid="values">{JSON.stringify(values)}</output></>;}
    render(<Harness />);
    fireEvent.click(screen.getByRole('switch',{name:'হোমপেজে ক্যাটেগরি দেখাবে'}));
    fireEvent.change(screen.getByLabelText('সেকশনের শিরোনাম'),{target:{value:'আজকের সংগ্রহ'}});
    const values=JSON.parse(screen.getByTestId('values').textContent || '{}');
    expect(values.category_section_enabled).toBe('false');expect(values.home_products_enabled).toBe('true');expect(values.home_products_title).toBe('আজকের সংগ্রহ');
  });
});

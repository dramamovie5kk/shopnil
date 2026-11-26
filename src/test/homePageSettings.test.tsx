import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePageSettings from '@/components/admin/HomePageSettings';
import { homePageDefaults, homeSectionEnabled, homeNumber, homeColor } from '@/lib/homePageSettings';
vi.mock('@/hooks/useProducts', () => ({
  useCategories: () => ({
    data: [
      { id: 'a', slug: 'mosquito-nets', name_bn: 'মশারি' },
      { id: 'b', slug: 'baby-nets', name_bn: 'শিশুর মশারি', parent_id: 'a' },
    ],
  }),
}));
afterEach(cleanup);
describe('home page settings',()=>{
  it('keeps existing sections visible and understands previous saved toggle values',()=>{
    expect(homeSectionEnabled('true')).toBe(true);expect(homeSectionEnabled('')).toBe(true);
    expect(homeSectionEnabled('false')).toBe(false);expect(homeSectionEnabled('0')).toBe(false);
  });
  it('lists the live categories in all six product sections and keeps the extra sections off by default', () => {
    const onChange = vi.fn();
    render(<HomePageSettings values={homePageDefaults} onChange={onChange} />);
    const pickers = screen.getAllByRole('combobox');
    expect(pickers).toHaveLength(6);
    for (const picker of pickers) {
      expect(picker.querySelector('option[value="mosquito-nets"]')).toHaveTextContent('মশারি');
      expect(picker.querySelector('option[value="baby-nets"]')).toHaveTextContent('শিশুর মশারি');
    }
    const toggle = screen.getByRole('switch', { name: 'সেকশন ৬ দেখাবে' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    fireEvent.change(pickers[5], { target: { value: 'baby-nets' } });
    expect(onChange.mock.calls).toEqual([['home_products_6_enabled', 'true'], ['home_products_6_category', 'baby-nets']]);
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

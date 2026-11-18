import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from '@/components/AppErrorBoundary';
afterEach(cleanup);
describe('unexpected page failure fallback',()=>{
  it('preserves healthy page content',()=>{
    render(<AppErrorBoundary><p>Healthy page</p></AppErrorBoundary>);
    expect(screen.getByText('Healthy page')).toBeInTheDocument();
  });
  it('shows a reload action instead of a blank page after a render failure',()=>{
    const log=vi.spyOn(console,'error').mockImplementation(()=>{});
    function Broken():never{throw new Error('Test chunk failure');}
    try{
      render(<AppErrorBoundary><Broken /></AppErrorBoundary>);
      expect(screen.getByRole('alert')).toHaveTextContent('পেজটি লোড করতে সমস্যা হয়েছে');
      expect(screen.getByRole('button',{name:'আবার লোড করুন'})).toBeInTheDocument();
    }finally{log.mockRestore();}
  });
});

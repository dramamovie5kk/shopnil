import { Component, type ReactNode } from 'react';

export default class AppErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(!this.state.failed)return this.props.children;
    return <main className="min-h-screen flex items-center justify-center p-6"><div className="max-w-md text-center space-y-4" role="alert">
      <h1 className="text-xl font-bold">পেজটি লোড করতে সমস্যা হয়েছে</h1>
      <p>আপনার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
      <button type="button" className="rounded bg-primary text-primary-foreground px-4 py-2" onClick={()=>window.location.reload()}>আবার লোড করুন</button>
    </div></main>;
  }
}

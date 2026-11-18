import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/integrations/cloudflare/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export default function ForgotPassword() {
  const [email,setEmail]=useState(''),[code,setCode]=useState(''),[password,setPassword]=useState('');
  const [nextCode,setNextCode]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setBusy(true);setError('');
    const result=await api.auth.recover({email,password,recovery_code:code.trim()});
    if(result.error)setError(result.error.message);
    else{setNextCode(result.data.recovery_code);setCode('');setPassword('');}
    setBusy(false);
  };
  return <main className="min-h-screen flex items-center justify-center p-6"><section className="w-full max-w-md space-y-4">
    <h1 className="text-2xl font-bold">পাসওয়ার্ড পুনরুদ্ধার</h1>
    {nextCode?<><p>পাসওয়ার্ড বদলেছে। পুরোনো recovery code আর কাজ করবে না। নতুন code সংরক্ষণ করুন:</p><code className="block break-all rounded bg-muted p-4 select-all">{nextCode}</code><Link to="/login">লগইন করুন</Link></>:<form onSubmit={submit} className="space-y-4">
      <p>Account তৈরির সময় পাওয়া recovery code ব্যবহার করুন। Code না থাকলে administrator-এর সঙ্গে যোগাযোগ করুন।</p>
      <div><Label htmlFor="recover-email">ইমেইল</Label><Input id="recover-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
      <div><Label htmlFor="recover-code">Recovery code</Label><Input id="recover-code" type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} required /></div>
      <div><Label htmlFor="recover-password">নতুন পাসওয়ার্ড</Label><Input id="recover-password" type="password" minLength={10} maxLength={256} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
      {error&&<p role="alert">{error}</p>}<Button disabled={busy} type="submit">পাসওয়ার্ড বদলান</Button>
    </form>}
  </section></main>;
}

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/integrations/cloudflare/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, loading } = useAuth();
  const client = useQueryClient();
  const [form,setForm] = useState({full_name:'',phone:'',address:'',city:''});
  const [busy,setBusy] = useState(false), [message,setMessage] = useState('');
  const profile = useQuery({queryKey:['profile',user?.id],enabled:!!user,queryFn:async()=>{
    const {data,error}=await api.from('profiles').select('*').eq('user_id',user!.id).maybeSingle();
    if(error)throw error;return data;
  }});
  useEffect(()=>{if(profile.data)setForm({full_name:profile.data.full_name||'',phone:profile.data.phone||'',address:profile.data.address||'',city:profile.data.city||''});},[profile.data]);
  if(loading||profile.isLoading&&user)return <p role="status" className="p-8">লোড হচ্ছে…</p>;
  if(!user)return <Navigate to="/login" replace />;
  const save=async(event:React.FormEvent)=>{
    event.preventDefault();setBusy(true);setMessage('');
    const result=profile.data?await api.from('profiles').update(form).eq('user_id',user.id):await api.from('profiles').insert({...form,user_id:user.id});
    if(result.error)setMessage(result.error.message);
    else{setMessage('প্রোফাইল আপডেট হয়েছে।');await client.invalidateQueries({queryKey:['profile',user.id]});}
    setBusy(false);
  };
  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 w-full max-w-xl mx-auto p-6 space-y-4"><h1 className="text-2xl font-bold">আপনার প্রোফাইল</h1>
    {profile.error?<p role="alert">প্রোফাইল লোড হয়নি। পেজটি রিফ্রেশ করুন।</p>:<form onSubmit={save} className="space-y-4">
      {([['full_name','নাম',100],['phone','ফোন',20],['address','ঠিকানা',2000],['city','শহর',100]] as const).map(([key,label,max])=><div key={key}><Label htmlFor={'profile-'+key}>{label}</Label><Input id={'profile-'+key} value={form[key]} maxLength={max} onChange={e=>setForm({...form,[key]:e.target.value})} /></div>)}
      {message&&<p role="status">{message}</p>}<Button disabled={busy} type="submit">সংরক্ষণ করুন</Button>
    </form>}
  </main><Footer /></div>;
}

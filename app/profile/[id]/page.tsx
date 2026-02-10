'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { ArrowLeft, User, Shield, Trophy, Flame, Calendar, Loader2 } from 'lucide-react';

export default function StudentProfile() {
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchStudent() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
      setLoading(false);
    }
    fetchStudent();
  }, [userId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  if (!profile) return <div className="p-10 text-center font-bold">Student not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10 flex flex-col items-center">
      
      {/* Navbar */}
      <div className="w-full max-w-2xl mb-8">
         <Link href="/leaderboard" className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-slate-600 font-bold hover:bg-slate-100 transition">
            <ArrowLeft size={20}/> Back to Leaderboard
         </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-indigo-100 w-full max-w-md text-center border border-slate-100 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
         
         {/* Avatar */}
         <div className="relative z-10 w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden mb-6 mt-6">
             {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover"/> : <User className="w-full h-full p-6 text-slate-400"/>}
         </div>

         <h1 className="text-3xl font-black text-slate-900 mb-1">{profile.full_name}</h1>
         <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm mb-8">{profile.grade_level}</p>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                 <div className="text-yellow-600 font-black text-2xl flex items-center justify-center gap-2">
                     <Trophy size={20}/> {profile.coins}
                 </div>
                 <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide mt-1">Total Coins</div>
             </div>
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                 <div className="text-indigo-600 font-black text-2xl flex items-center justify-center gap-2">
                     <Flame size={20}/> {profile.xp}
                 </div>
                 <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mt-1">Total XP</div>
             </div>
         </div>

         {/* Date Joined */}
         <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 font-bold text-sm">
             <Calendar size={16}/> Student since {new Date(profile.created_at).getFullYear()}
         </div>

      </div>
    </div>
  );
}
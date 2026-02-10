'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Trophy, Crown, User, Loader2, Shield, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 🆕 NEW: Tab State
  const [activeTab, setActiveTab] = useState<'class' | 'global'>('class');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]); // Refetch when tab switches

  async function fetchLeaderboard() {
    setLoading(true);
    
    // 1. Get Current User Info
    const { data: { user } } = await supabase.auth.getUser();
    
    // We need the user's profile to know their grade level for filtering
    let userProfile = null;
    if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, grade_level, xp, avatar_url')
          .eq('id', user.id)
          .single();
        
        userProfile = profile;
        setCurrentUser(profile || { id: user.id, full_name: 'You', xp: 0, grade_level: '...', avatar_url: null });
    }

    // 2. Build Query (Logic from New Code)
    let query = supabase
      .from('profiles')
      .select('id, full_name, xp, grade_level, avatar_url')
      .order('xp', { ascending: false })
      .limit(50);

    // 🛑 FILTER LOGIC: If tab is 'class' and user has a grade, filter by it
    if (activeTab === 'class' && userProfile?.grade_level) {
        query = query.eq('grade_level', userProfile.grade_level);
    }

    const { data } = await query;

    if (data) {
      setLeaders(data);
    }
    setLoading(false);
  }

  // Helper for badges in the list view
  const getRankBadge = (index: number) => {
      if (index === 0) return <div className="bg-yellow-100 p-2 rounded-full"><Crown size={20} className="text-yellow-600 fill-yellow-600"/></div>; 
      if (index === 1) return <div className="bg-gray-100 p-2 rounded-full"><Medal size={20} className="text-slate-400 fill-slate-400"/></div>; 
      if (index === 2) return <div className="bg-orange-100 p-2 rounded-full"><Medal size={20} className="text-orange-600 fill-orange-600"/></div>; 
      return <div className="w-10 h-10 flex items-center justify-center font-black text-slate-400">#{index + 1}</div>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-900"><Loader2 className="animate-spin text-white" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans pb-24">
      
      {/* --- HEADER --- */}
      <div className="bg-indigo-900 text-white p-6 pb-28 rounded-b-[3rem] shadow-xl relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>

         <div className="max-w-2xl mx-auto relative z-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white font-bold mb-6 transition">
               <ArrowLeft size={20}/> Back to Dashboard
            </Link>
            <div className="text-center">
               <div className="w-16 h-16 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center text-yellow-900 shadow-lg mb-4 rotate-3">
                  <Trophy size={32}/>
               </div>
               <h1 className="text-4xl font-black tracking-tight mb-2">Leaderboard</h1>
               <p className="text-indigo-200 font-medium mb-6">Top students of the week. Can you reach #1?</p>

               {/* 🆕 TABS (Integrated here) */}
               <div className="bg-indigo-800/50 p-1.5 rounded-2xl flex max-w-sm mx-auto backdrop-blur-sm border border-indigo-700/50">
                  <button 
                    onClick={() => setActiveTab('class')} 
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'class' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-300 hover:text-white'}`}
                  >
                     <Shield size={14}/> {currentUser?.grade_level || "My Class"}
                  </button>
                  <button 
                    onClick={() => setActiveTab('global')} 
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'global' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-300 hover:text-white'}`}
                  >
                     <GlobeIcon/> Global Top 50
                  </button>
               </div>

            </div>
         </div>
      </div>

      {/* --- PODIUM (CLICKABLE) --- */}
      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-20 mb-8">
         {leaders.length === 0 ? (
             <div className="bg-white p-8 rounded-3xl text-center shadow-lg">
                 <p className="text-slate-400 font-bold">No students found here yet.</p>
                 <p className="text-slate-500 text-sm mt-1">Be the first to earn XP!</p>
             </div>
         ) : (
             <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
                
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    {leaders[1] && (
                       <Link href={`/profile/${leaders[1].id}`} className="w-full bg-white rounded-t-3xl rounded-b-2xl p-4 flex flex-col items-center shadow-lg transform translate-y-4 hover:scale-105 transition-transform cursor-pointer">
                          <div className="w-12 h-12 rounded-full border-4 border-slate-200 overflow-hidden mb-2 bg-slate-100">
                             {leaders[1].avatar_url ? <img src={leaders[1].avatar_url} className="w-full h-full object-cover"/> : <User className="p-2 text-slate-400"/>}
                          </div>
                          <div className="font-black text-slate-700 text-sm text-center line-clamp-1">{leaders[1].full_name?.split(' ')[0]}</div>
                          <div className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-xs mt-2">2nd</div>
                          <div className="font-bold text-slate-400 text-xs mt-1">{leaders[1].xp} XP</div>
                       </Link>
                    )}
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center relative z-10">
                    {leaders[0] && (
                       <Link href={`/profile/${leaders[0].id}`} className="w-full bg-gradient-to-b from-yellow-50 to-white rounded-t-[2.5rem] rounded-b-2xl p-4 pb-8 flex flex-col items-center shadow-xl border-t-4 border-yellow-400 hover:scale-105 transition-transform cursor-pointer">
                          <Crown size={32} className="text-yellow-500 absolute -top-5 animate-bounce"/>
                          <div className="w-16 h-16 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 shadow-sm bg-yellow-50">
                             {leaders[0].avatar_url ? <img src={leaders[0].avatar_url} className="w-full h-full object-cover"/> : <User className="p-2 text-yellow-600"/>}
                          </div>
                          <div className="font-black text-slate-800 text-base text-center line-clamp-1">{leaders[0].full_name?.split(' ')[0]}</div>
                          <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-full text-sm mt-2">1st</div>
                          <div className="font-bold text-yellow-600 text-sm mt-1">{leaders[0].xp} XP</div>
                       </Link>
                    )}
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                    {leaders[2] && (
                       <Link href={`/profile/${leaders[2].id}`} className="w-full bg-white rounded-t-3xl rounded-b-2xl p-4 flex flex-col items-center shadow-lg transform translate-y-8 hover:scale-105 transition-transform cursor-pointer">
                          <div className="w-12 h-12 rounded-full border-4 border-orange-200 overflow-hidden mb-2 bg-orange-50">
                             {leaders[2].avatar_url ? <img src={leaders[2].avatar_url} className="w-full h-full object-cover"/> : <User className="p-2 text-orange-400"/>}
                          </div>
                          <div className="font-black text-slate-700 text-sm text-center line-clamp-1">{leaders[2].full_name?.split(' ')[0]}</div>
                          <div className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-full text-xs mt-2">3rd</div>
                          <div className="font-bold text-slate-400 text-xs mt-1">{leaders[2].xp} XP</div>
                       </Link>
                    )}
                </div>

             </div>
         )}
      </div>

      {/* --- LIST (CLICKABLE) --- */}
      <div className="max-w-2xl mx-auto px-4 space-y-3">
         {leaders.slice(3).map((player, index) => {
            const isMe = currentUser && player.id === currentUser.id;
            return (
                <Link key={player.id} href={`/profile/${player.id}`} className={`block p-4 rounded-2xl shadow-sm flex items-center gap-4 border transition-all hover:scale-[1.02] cursor-pointer ${isMe ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                   <div className="font-black text-slate-300 w-6 text-center">{index + 4}</div>
                   <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                      {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover"/> : <User className="w-full h-full p-2 text-slate-300"/>}
                   </div>
                   <div className="flex-1">
                      <h3 className={`font-bold ${isMe ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {player.full_name} {isMe && '(You)'}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">{player.grade_level}</p>
                   </div>
                   <div className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">
                      {player.xp} XP
                   </div>
                </Link>
            );
         })}
      </div>

      {/* --- FOOTER (CLICKABLE) --- */}
      {currentUser && (
         <Link href={`/profile/${currentUser.id}`} className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 cursor-pointer hover:bg-slate-50 transition">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
               <div className="bg-indigo-600 text-white font-black px-3 py-1 rounded-lg text-sm shadow-md shadow-indigo-200">
                  #{leaders.findIndex(p => p.id === currentUser.id) !== -1 ? leaders.findIndex(p => p.id === currentUser.id) + 1 : "50+"}
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-indigo-100">
                  {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover"/> : <User className="w-full h-full p-2 text-slate-300"/>}
               </div>
               <div className="flex-1">
                  <h3 className="font-bold text-slate-800">You</h3>
                  <p className="text-xs font-bold text-slate-400">View your stats</p>
               </div>
               <div className="font-black text-indigo-600 text-xl">
                  {currentUser.xp} XP
               </div>
            </div>
         </Link>
      )}

    </div>
  );
}

// Simple Globe Icon Component
function GlobeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    )
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { ArrowLeft, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserEmail = 'student@test.com'; 

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      // 1. Get all profiles, sorted by XP (Highest first)
      const { data, error } = await supabase
        .from('profiles')
        .select('email, xp, coins')
        .order('xp', { ascending: false })
        .limit(20); 

      if (data) setLeaders(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatName = (email: string) => email ? email.split('@')[0] : 'Unknown';

  return (
    <div className="min-h-screen bg-indigo-50 font-sans selection:bg-indigo-200">
      
      {/* HEADER */}
      <div className="bg-indigo-600 p-6 pb-24 text-center relative shadow-xl">
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 text-indigo-200 hover:text-white transition flex items-center gap-2 font-bold"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>
        <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">
          LEADERBOARD
        </h1>
        <p className="text-indigo-200 font-medium">Top students of the week</p>
      </div>

      <div className="max-w-md mx-auto -mt-16 px-6 pb-12">
        {/* TOP 3 PODIUM (Only shows when NOT loading) */}
        {!loading && leaders.length > 0 && (
          <div className="flex items-end justify-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 2ND PLACE */}
            {leaders[1] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center text-gray-500 font-bold mb-2 relative">
                  {formatName(leaders[1].email).charAt(0).toUpperCase()}
                  <div className="absolute -bottom-2 bg-gray-300 text-xs font-bold px-2 rounded-full border border-white">#2</div>
                </div>
                <div className="text-center">
                   <p className="font-bold text-gray-700 text-sm">{formatName(leaders[1].email)}</p>
                   <p className="text-xs text-indigo-500 font-bold">{leaders[1].xp} XP</p>
                </div>
              </div>
            )}

            {/* 1ST PLACE */}
            {leaders[0] && (
              <div className="flex flex-col items-center -mt-6">
                <Crown className="text-yellow-400 fill-yellow-400 mb-1 animate-bounce" size={32} />
                <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-yellow-300 shadow-xl flex items-center justify-center text-yellow-700 text-2xl font-black mb-2 relative">
                  {formatName(leaders[0].email).charAt(0).toUpperCase()}
                   <div className="absolute -bottom-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full border-2 border-white shadow-sm">#1</div>
                </div>
                <div className="text-center">
                   <p className="font-bold text-gray-900">{formatName(leaders[0].email)}</p>
                   <p className="text-sm text-yellow-600 font-black">{leaders[0].xp} XP</p>
                </div>
              </div>
            )}

            {/* 3RD PLACE */}
            {leaders[2] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow-lg flex items-center justify-center text-orange-700 font-bold mb-2 relative">
                  {formatName(leaders[2].email).charAt(0).toUpperCase()}
                  <div className="absolute -bottom-2 bg-orange-300 text-orange-900 text-xs font-bold px-2 rounded-full border border-white">#3</div>
                </div>
                <div className="text-center">
                   <p className="font-bold text-gray-700 text-sm">{formatName(leaders[2].email)}</p>
                   <p className="text-xs text-indigo-500 font-bold">{leaders[2].xp} XP</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FULL LIST */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-50 min-h-[300px]">
          {loading ? (
             // 🔥 SKELETON LOADER (Shows while loading)
             <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
             </div>
          ) : (
            leaders.map((student, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 
                  ${student.email === currentUserEmail ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <div className="font-black text-gray-300 w-6 text-center">{index + 1}</div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                    index === 1 ? 'bg-gray-100 text-gray-600' : 
                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                  {formatName(student.email).charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-grow">
                  <p className={`font-bold ${student.email === currentUserEmail ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {formatName(student.email)} {student.email === currentUserEmail && '(You)'}
                  </p>
                  <p className="text-xs text-gray-400">{student.coins} Coins</p>
                </div>
                
                <div className="font-black text-indigo-600">{student.xp} XP</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
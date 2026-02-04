'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trophy, Flame, Target, BookOpen, 
  ShoppingBag, LogOut, User,
  Calculator, Beaker, Monitor, ChevronRight, Library, Video,
  GraduationCap, ChevronDown // <--- Added Icons
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // --- REAL STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userName, setUserName] = useState("Student");
  const [dailyDone, setDailyDone] = useState(false);
  
  // Grade Switching State
  const [gradeLevel, setGradeLevel] = useState("Class 1");
  const [updatingGrade, setUpdatingGrade] = useState(false);

  // GES / NaCCA Grades List
  const grades = [
    'Class 1', 'Class 2', 'Class 3', 
    'Class 4', 'Class 5', 'Class 6',
    'JHS 1', 'JHS 2', 'JHS 3'
  ];

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    const getData = async () => {
      // 1. Check who is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login'); 
        return;
      }

      // 2. Fetch their Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        // Name Logic
        if (profileData.full_name) {
          setUserName(profileData.full_name);
        } else {
          const namePart = user.email?.split('@')[0] || "Student";
          const formatName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          setUserName(formatName);
        }

        // Grade Logic (Default to Class 1 if missing)
        if (profileData.grade_level) {
          setGradeLevel(profileData.grade_level);
        }

        // Daily Challenge Status
        const today = new Date().toISOString().split('T')[0];
        const challengeKey = `daily_challenge_${today}_${user.id}`; 
        const isDone = localStorage.getItem(challengeKey) === 'completed';
        setDailyDone(isDone);
      }

      setLoading(false);
    };

    getData();
  }, [router]);

  // --- HANDLE GRADE CHANGE ---
  const handleGradeChange = async (newGrade: string) => {
    setGradeLevel(newGrade); // Update UI instantly
    setUpdatingGrade(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ grade_level: newGrade })
        .eq('id', user.id);
    }
    
    // Simulate a quick "saved" delay for effect
    setTimeout(() => setUpdatingGrade(false), 500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-black italic text-lg tracking-tighter">EW</div>
          <span className="text-xl font-black text-indigo-900 italic tracking-tighter">
            E-WORKBOOK<span className="text-orange-400">.io</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/shop">
            <div className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 transition px-4 py-2 rounded-full border border-yellow-300 cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-800 text-[10px] font-bold">$</div>
              <span className="font-bold text-yellow-800 text-sm">{profile?.coins ?? 0}</span>
              <ShoppingBag size={16} className="text-yellow-700 ml-1" />
            </div>
          </Link>

          <Link href="/settings">
             <div className="relative group cursor-pointer">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-100 object-cover" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-500 font-bold">
                   {userName.charAt(0)}
                 </div>
               )}
               <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-white">
                 LVL {Math.floor((profile?.xp || 0) / 100) + 1}
               </div>
             </div>
          </Link>
          
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* HEADER & GRADE SELECTOR */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Welcome back, <span className="text-indigo-600">{userName}</span>! 👋
            </h1>
            
            {/* 🔥 NEW QUICK GRADE SELECTOR 🔥 */}
            <div className="flex items-center gap-3 mt-4">
              <div className="relative group">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold cursor-pointer transition-all ${updatingGrade ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-indigo-100 text-gray-600 hover:border-indigo-300'}`}>
                  {updatingGrade ? <CheckCircleIcon size={18}/> : <GraduationCap size={18} className="text-indigo-500"/>}
                  
                  {/* The Select Dropdown Overlay */}
                  <select 
                    value={gradeLevel}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  
                  <span>{gradeLevel}</span>
                  <ChevronDown size={14} className="opacity-50"/>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                Current Curriculum
              </span>
            </div>

          </div>
          
          {/* XP CARD */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full md:w-80">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
              <span>Level {Math.floor((profile?.xp || 0) / 100) + 1}</span>
              <span>{(profile?.xp || 0) % 100} / 100 XP</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(profile?.xp || 0) % 100}%` }}></div>
            </div>
          </div>
        </header>

        {/* DAILY CHALLENGE */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200">
           <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10"><Trophy size={200} /></div>
           <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                 <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">Daily Goal</span>
               </div>
               <h2 className="text-3xl font-black mb-2">Challenge of the Day</h2>
               <p className="text-indigo-100 max-w-md">Complete 3 random questions to earn <span className="font-bold text-yellow-300">+50 XP</span>.</p>
             </div>
             {dailyDone ? (
               <button disabled className="bg-white/20 text-white cursor-not-allowed px-8 py-4 rounded-xl font-bold flex items-center gap-2"><Trophy size={20}/> Challenge Completed</button>
             ) : (
               <Link href="/daily-challenge"><button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"><Flame size={20} className="text-orange-500" /> Start Challenge</button></Link>
             )}
           </div>
        </div>

        {/* LIBRARY SECTION */}
        <div>
          <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">My Library</h3>
          
          {/* 1. READER BOOKS */}
          <Link href="/learn">
            <div className="group bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden mb-6">
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-blue-600 text-white p-2 rounded-lg"><BookOpen size={24} /></div>
                   <h3 className="text-2xl font-black text-gray-900">Reader Books & Lessons</h3>
                 </div>
                 <p className="text-blue-800 font-medium max-w-md">
                   Access your class textbooks for <span className="font-black underline decoration-blue-300">{gradeLevel}</span>.
                 </p>
               </div>
               
               <div className="hidden md:block text-blue-200 group-hover:text-blue-300 transition-colors transform group-hover:scale-110 duration-500">
                 <Library size={100} />
               </div>
               
               <div className="absolute right-6 bottom-6 md:static">
                 <div className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   Open Library <ChevronRight size={18} />
                 </div>
               </div>
            </div>
          </Link>

          {/* 2. LABS & CRAFTS */}
          <Link href="/labs">
            <div className="group bg-red-50 p-8 rounded-3xl border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-red-600 text-white p-2 rounded-lg"><Beaker size={24} /></div>
                   <h3 className="text-2xl font-black text-gray-900">Labs & DIY Crafts</h3>
                 </div>
                 <p className="text-red-800 font-medium max-w-md">
                   Watch exciting science experiments and learn how to build cool crafts.
                 </p>
               </div>
               
               <div className="hidden md:block text-red-200 group-hover:text-red-300 transition-colors transform group-hover:scale-110 duration-500">
                 <Video size={100} /> 
               </div>
               
               <div className="absolute right-6 bottom-6 md:static">
                 <div className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 group-hover:bg-red-600 group-hover:text-white transition-all">
                   Watch Videos <ChevronRight size={18} />
                 </div>
               </div>
            </div>
          </Link>
        </div>
<div className="mt-6"> {/* Spacing */} </div>

          <Link href="/bece">
            <div className="group bg-slate-900 p-8 rounded-3xl border-2 border-slate-700 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-between relative overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-white text-slate-900 p-2 rounded-lg"><GraduationCap size={24} /></div>
                   <h3 className="text-2xl font-black text-white">BECE Past Questions</h3>
                 </div>
                 <p className="text-slate-400 font-medium max-w-md">
                   Official past questions for Final Year Candidates. <span className="text-yellow-400 font-bold">JHS 3 Only.</span>
                 </p>
               </div>
               
               <div className="hidden md:block text-slate-700 group-hover:text-white/20 transition-colors transform group-hover:scale-110 duration-500">
                 <GraduationCap size={120} />
               </div>
               
               <div className="absolute right-6 bottom-6 md:static">
                 <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 group-hover:bg-indigo-500 transition-all border border-indigo-400">
                   Start Exam <ChevronRight size={18} />
                 </div>
               </div>
            </div>
          </Link>

        {/* PRACTICE ZONE (WORKBOOKS) */}
        <div>
          <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 mt-8">Workbook Practice Zone</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* MATH */}
            <Link href="/math">
              <div className="group bg-white p-6 rounded-3xl border-2 border-transparent hover:border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Calculator size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Mathematics</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">Algebra, Geometry & Logic</p>
                  <div className="flex items-center text-orange-600 font-bold text-sm">
                    Open Workbook <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </div>
              </div>
            </Link>

            {/* SCIENCE */}
            <Link href="/science">
              <div className="group bg-white p-6 rounded-3xl border-2 border-transparent hover:border-teal-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Beaker size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Science</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">Biology, Physics & Chemistry</p>
                  <div className="flex items-center text-teal-600 font-bold text-sm">
                    Open Workbook <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </div>
              </div>
            </Link>

            {/* COMPUTING */}
            <Link href="/computing">
              <div className="group bg-white p-6 rounded-3xl border-2 border-transparent hover:border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Monitor size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Computing</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">Hardware, Software & IO</p>
                  <div className="flex items-center text-purple-600 font-bold text-sm">
                    Open Workbook <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}

// Simple Icon for the "Updating" state
function CheckCircleIcon({size}: {size: number}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  );
}
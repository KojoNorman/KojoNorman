'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import {
  Trophy, Flame, ShoppingBag, LogOut,
  Calculator, Beaker, Monitor, ChevronRight, Library, Video,
  GraduationCap, ChevronDown, BookOpen, Loader2, Lock,
  LayoutGrid, Settings, Menu, X, Bell, CheckCircle,
  PenTool, Globe, Music, User, Crown,
  Clock, RefreshCw
} from 'lucide-react';

import 'katex/dist/katex.min.css';

export default function Dashboard() {
  const router = useRouter();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userName, setUserName] = useState("Student");
  const [dailyDone, setDailyDone] = useState(false);
  const [gradeLevel, setGradeLevel] = useState("Class 1");
  const [updatingGrade, setUpdatingGrade] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);

  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // --- SUBJECTS CONFIG ---
  const allSubjects = [
    { name: "Mathematics", icon: <Calculator size={24}/>, color: "bg-blue-100 text-blue-600", levels: ['all'] },
    { name: "English Language", icon: <PenTool size={24}/>, color: "bg-red-100 text-red-600", levels: ['all'] },
    { name: "Science", icon: <Beaker size={24}/>, color: "bg-green-100 text-green-600", levels: ['all'] },
    { name: "Computing", icon: <Monitor size={24}/>, color: "bg-purple-100 text-purple-600", levels: ['all'] },
    { name: "Social Studies", icon: <Globe size={24}/>, color: "bg-orange-100 text-orange-600", levels: ['jhs'] },
    { name: "Our World Our People", icon: <User size={24}/>, color: "bg-teal-100 text-teal-600", levels: ['primary'] },
    { name: "RME", icon: <BookOpen size={24}/>, color: "bg-yellow-100 text-yellow-600", levels: ['all'] },
    { name: "Creative Arts", icon: <Music size={24}/>, color: "bg-pink-100 text-pink-600", levels: ['all'] },
    { name: "French", icon: <span className="font-bold text-lg">Fr</span>, color: "bg-indigo-100 text-indigo-600", levels: ['upper-primary', 'jhs'] },
    { name: "History", icon: <Clock size={24}/>, color: "bg-amber-100 text-amber-600", levels: ['all'] },
  ];

  // Filter Subjects Helper
  const getFilteredSubjects = () => {
    let category = 'primary';
    if (gradeLevel.startsWith('JHS')) category = 'jhs';
    else if (['Class 4', 'Class 5', 'Class 6'].includes(gradeLevel)) category = 'upper-primary';

    return allSubjects.filter(sub => {
        if (sub.levels.includes('all')) return true;
        if (category === 'primary') return sub.levels.includes('primary');
        if (category === 'upper-primary') return sub.levels.includes('primary') || sub.levels.includes('upper-primary');
        if (category === 'jhs') return sub.levels.includes('jhs');
        return false;
    });
  };
  const displayedSubjects = getFilteredSubjects();

  // --- FETCH DATA ---
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      if (data.full_name) setUserName(data.full_name);
      else setUserName(user.email?.split('@')[0] || "Student");
      
      if (data.grade_level) setGradeLevel(data.grade_level);

      const today = new Date().toISOString().split('T')[0];
      const isDone = localStorage.getItem(`daily_challenge_${today}_${user.id}`) === 'completed';
      setDailyDone(isDone);
    }
    setLoading(false);
    setRefreshing(false);
  }, [router]);

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
        (payload: any) => {
           if (profile && payload.new.id === profile.id) {
               setProfile(payload.new);
               if (payload.new.grade_level) setGradeLevel(payload.new.grade_level);
           }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData, profile?.id]);

  const handleGradeChange = async (newGrade: string) => {
    setGradeLevel(newGrade);
    setUpdatingGrade(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').update({ grade_level: newGrade }).eq('id', user.id);
    setTimeout(() => setUpdatingGrade(false), 500);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const getSubjectDetails = (subject: string, grade: string) => {
    const isLower = ['Class 1', 'Class 2', 'Class 3'].includes(grade);
    const isUpper = ['Class 4', 'Class 5', 'Class 6'].includes(grade);
    switch(subject) {
      case "Mathematics": return isLower ? "Counting & Shapes" : isUpper ? "Fractions & Decimals" : "Algebra & Sets";
      case "Science": return isLower ? "Living Things" : isUpper ? "Forces & Energy" : "Physics & Biology";
      case "Computing": return isLower ? "Computer Parts" : isUpper ? "Typing Skills" : "Coding & Logic";
      case "English Language": return isLower ? "Phonics & Reading" : isUpper ? "Grammar & Writing" : "Literature";
      case "Our World Our People": return "Citizenship & Culture";
      case "Social Studies": return "Environment & Nation";
      default: return "General Knowledge";
    }
  };

  // --- 🔔 SMART NOTIFICATION LOGIC ---
  const getNotifications = () => {
      const notifs = [
          { id: 1, text: `Welcome back, ${userName.split(' ')[0]}!`, time: "Just now", type: "info", link: "/settings" },
      ];

      if (!dailyDone) {
          notifs.push({ id: 2, text: "Your Daily Challenge is ready!", time: "Expires soon", type: "alert", link: "/daily" });
      } else {
          notifs.push({ id: 2, text: "Daily Challenge completed! Great job.", time: "Today", type: "success", link: "/leaderboard" });
      }

      if (profile?.coins > 100) {
          notifs.push({ id: 3, text: "You have coins to spend in the Shop!", time: "1 day ago", type: "success", link: "/shop" });
      }

      return notifs;
  };
  const activeNotifications = getNotifications();

  const Overlay = () => (
      <div 
        className="fixed inset-0 z-40 bg-transparent cursor-default" 
        onClick={() => setShowNotifications(false)}
      ></div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;
  const isJHS = gradeLevel.includes("JHS");
  const isGradeLocked = profile?.grade_level && profile?.grade_level !== "";

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-slate-900">

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="h-40 flex flex-col items-center justify-center border-b border-dashed border-gray-100 relative bg-slate-50/50">
            <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400"><X size={24}/></button>
            <div className="relative w-50 h-30 flex items-center justify-center">
                {/* 🖼️ LOGO REPLACEMENT - MADE BIGGER */}
                <div className="flex flex-col items-center">
                    <img 
                      src="/logo.png" 
                      alt="My E-Workbook Logo" 
                      className="h-30 w-auto object-contain" // Increased height from h-20 to h-28
                    />
                </div>
            </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavItem href="/dashboard" icon={<LayoutGrid size={20}/>} label="Dashboard" active />
            <NavItem href="/shop" icon={<ShoppingBag size={20}/>} label="Coin Shop" badge={`${profile?.coins ?? 0}`} badgeColor="bg-orange-100 text-orange-700" />
            <NavItem href="/leaderboard" icon={<Crown size={20}/>} label="Leaderboard" />
            <NavItem href="/learn" icon={<Library size={20}/>} label="My Library" />
            <NavItem href="/labs" icon={<Video size={20}/>} label="Science Labs" />
            <NavItem href="/bece" icon={<Trophy size={20}/>} label="BECE Mock" />
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-indigo-50 transition border border-gray-100 shadow-sm group">
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"/>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">{userName.charAt(0)}</div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700">{userName}</p>
                    <p className="text-xs text-gray-500 truncate font-medium">{gradeLevel}</p>
                </div>
                <Settings size={18} className="text-gray-400 group-hover:text-indigo-500"/>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500/80 text-xs font-bold p-3 mt-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
                <LogOut size={16}/> Sign Out
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
           <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-700"><Menu size={28}/></button>
           <div onClick={() => router.push('/shop')} className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer active:scale-95 transition">
             <ShoppingBag size={14}/> {profile?.coins}
           </div>
        </header>

        <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
           
           {/* Top Bar */}
           <div className="hidden md:flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <button onClick={() => fetchDashboardData(true)} className="flex items-center gap-2 hover:text-indigo-600 transition" disabled={refreshing}>
                      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""}/> 
                      {refreshing ? "Updating..." : "Refresh Data"}
                  </button>
              </div>
              <div className="flex items-center gap-4">
                  
                  {/* Grade Selector */}
                  <div 
                    onClick={() => isGradeLocked && alert("Grade level is locked. Contact your Admin to change it.")}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all shadow-sm 
                        ${isGradeLocked 
                            ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                            : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200 cursor-pointer'}`
                    }
                  >
                     {updatingGrade ? <Loader2 className="animate-spin" size={18}/> : <GraduationCap size={20} className={isGradeLocked ? "text-slate-400" : "text-indigo-600"}/>}
                     <select 
                        value={gradeLevel} 
                        onChange={(e) => handleGradeChange(e.target.value)} 
                        disabled={isGradeLocked} 
                        className={`absolute inset-0 w-full h-full opacity-0 ${isGradeLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                     >
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                     </select>
                     <span className="font-bold">{gradeLevel}</span>
                     {isGradeLocked ? <Lock size={14} className="opacity-50"/> : <ChevronDown size={16} className="opacity-50"/>}
                  </div>

                  {/* 🔔 SMART NOTIFICATION AREA */}
                  <div className="relative">
                     {/* Overlay to close menu when clicking outside */}
                     {showNotifications && <Overlay />}

                     <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition shadow-sm relative z-50
                            ${showNotifications ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'}
                        `}
                     >
                        <Bell size={22} />
                        {/* Red Dot if there are alerts */}
                        {activeNotifications.some(n => n.type === 'alert') && (
                            <div className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></div>
                        )}
                     </button>

                     {showNotifications && (
                        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                           <div className="flex justify-between items-center px-4 py-2 border-b border-gray-50 mb-2">
                               <span className="font-bold text-sm text-gray-800">Notifications</span>
                               <span 
                                 className="text-[10px] font-bold text-indigo-500 cursor-pointer hover:underline"
                                 onClick={() => setShowNotifications(false)}
                               >
                                 Close
                               </span>
                           </div>
                           <div className="space-y-1">
                               {activeNotifications.map(notif => (
                                   <div 
                                     key={notif.id} 
                                     onClick={() => {
                                         setShowNotifications(false);
                                         router.push(notif.link);
                                     }}
                                     className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition group"
                                   >
                                       <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 
                                            ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-orange-500' : 'bg-blue-500'}`}
                                       ></div>
                                       <div>
                                           <p className="text-xs font-bold text-gray-700 leading-tight group-hover:text-indigo-600 transition-colors">
                                               {notif.text}
                                           </p>
                                           <p className="text-[10px] text-gray-400 font-medium mt-1">{notif.time}</p>
                                       </div>
                                       <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                           <ChevronRight size={14} className="text-gray-400"/>
                                       </div>
                                   </div>
                               ))}
                           </div>
                        </div>
                     )}
                  </div>
              </div>
           </div>

           {/* --- WELCOME BANNER --- */}
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                       <h1 className="text-3xl md:text-4xl font-black mb-2">Hello, {userName.split(' ')[0]}! 👋</h1>
                       <p className="text-indigo-200 font-medium">Ready to continue your streak?</p>
                    </div>
                    <div className="flex gap-4">
                       <div onClick={() => router.push('/shop')} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 hover:bg-white/30 transition cursor-pointer select-none">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 shadow-sm"><ShoppingBag size={16}/></div>
                          <span className="font-black">{profile?.coins ?? 0}</span>
                       </div>
                       <div onClick={() => router.push('/leaderboard')} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 hover:bg-white/30 transition cursor-pointer select-none">
                          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-orange-900 shadow-sm"><Flame size={16}/></div>
                          <span className="font-black">{profile?.xp ?? 0} XP</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-8 flex flex-wrap gap-3">
                    {dailyDone ? (
                        <button disabled className="bg-white/20 text-indigo-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                            <CheckCircle size={18}/> Daily Completed
                        </button>
                    ) : (
                        <button onClick={() => router.push('/daily')} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition flex items-center gap-2 transform active:scale-95">
                           <Flame size={18}/> Daily Challenge
                        </button>
                    )}
                    <button onClick={() => router.push('/shop')} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition flex items-center gap-2">
                       <ShoppingBag size={18}/> Visit Shop
                    </button>
                 </div>
              </div>
           </div>

           {/* --- SUBJECTS GRID --- */}
           <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-500"/> My Subjects
           </h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedSubjects.map((sub) => (
                  <Link key={sub.name} href={`/practice/${sub.name}`} className="group bg-white p-6 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${sub.color.split(' ')[0]}`}></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 ${sub.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>{sub.icon}</div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><ChevronRight size={18} /></div>
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-800 leading-tight mb-1">{sub.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">{getSubjectDetails(sub.name, gradeLevel)}</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1"><span>Progress</span><span>{Math.floor(Math.random() * 60) + 10}%</span></div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[30%]"></div></div>
                    </div>
                  </Link>
              ))}
           </div>

           {/* --- BECE SECTION --- */}
           {isJHS && (
             <div className={`mt-10 rounded-[2rem] p-8 relative overflow-hidden transition-all bg-slate-900 text-white`}>
                <div className="absolute right-0 top-0 p-10 opacity-10"><GraduationCap size={200}/></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                   <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl bg-indigo-600 text-white`}><GraduationCap size={32}/></div>
                      <div>
                         <h3 className="text-2xl font-black">BECE Past Questions</h3>
                         <p className={`font-medium mt-1 text-slate-400`}>Official JHS 3 Exam Preparation</p>
                      </div>
                   </div>
                   <button onClick={() => router.push('/bece')} className="px-8 py-4 bg-white text-slate-900 hover:bg-indigo-50 font-black rounded-xl transition shadow-lg">Start Exam Mode</button>
                </div>
             </div>
           )}
           <div className="mt-16 mb-8 text-center text-gray-400 text-sm font-bold opacity-60">&copy; 2026 My E-Workbook • Learning made fun</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({href, icon, label, active, badge, badgeColor, color}: any) {
  const activeStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-200";
  const inactiveStyle = "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600";
  return (
    <Link href={href} className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold ${active ? activeStyle : inactiveStyle}`}>
       <div className="flex items-center gap-3">
          <div className={`${active ? 'text-white' : (color || 'text-slate-400 group-hover:text-indigo-500')} transition-colors`}>{icon}</div>
          <span>{label}</span>
       </div>
       {badge && <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${badgeColor || 'bg-indigo-500 text-white'}`}>{badge}</span>}
    </Link>
  );
}
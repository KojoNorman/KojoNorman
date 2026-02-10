'use client';
import Link from 'next/link';
import { 
  Rocket, Trophy, BookOpen, Video, ArrowRight, 
  CheckCircle, Star, ShieldCheck, Play 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-200">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             {/* Logo Placeholder - You can use your img tag here */}
             <div className="text-3xl font-black text-indigo-900 italic tracking-tighter">EW<span className="text-orange-500">.io</span></div>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/login" className="font-bold text-slate-600 hover:text-indigo-600 transition hidden md:block">
               Log In
             </Link>
             <Link href="/register" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition shadow-lg shadow-indigo-200">
               Get Started
             </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
                <Star size={14} className="fill-orange-600"/> #1 E-Learning Platform in Ghana
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Make Learning <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Addictive.</span>
             </h1>
             <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Master Math, Science, and Computing with gamified quizzes, video labs, and digital textbooks. Prepare for BECE the fun way!
             </p>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition flex items-center justify-center gap-2 shadow-xl">
                   Start Learning Now <Rocket size={20}/>
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-2">
                   Student Login
                </Link>
             </div>
             
             <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> JHS 1-3 Covered</span>
                <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> BECE Past Questions</span>
             </div>
          </div>

          {/* Hero Visual (Mockup) */}
          <div className="flex-1 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[100px] rounded-full -z-10"></div>
             
             {/* Floating Cards Mockup */}
             <div className="relative z-10 animate-in zoom-in duration-1000">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 transform md:rotate-[-6deg] max-w-sm mx-auto">
                   <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={80}/></div>
                      <div className="relative z-10">
                         <span className="text-xs font-black uppercase tracking-widest opacity-80">Daily Streak</span>
                         <h3 className="text-3xl font-black mt-1">Challenge of the Day</h3>
                         <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm">Play Now</button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                         <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><BookOpen size={20}/></div>
                         <div>
                            <h4 className="font-bold text-slate-800 text-sm">Math Homework</h4>
                            <p className="text-xs text-slate-400 font-bold">In Progress • 80%</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-teal-50 border border-teal-100">
                         <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600"><Video size={20}/></div>
                         <div>
                            <h4 className="font-bold text-slate-800 text-sm">Science Lab</h4>
                            <p className="text-xs text-slate-400 font-bold">New Video Added</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-slate-50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to <span className="text-indigo-600">Ace Exams</span></h2>
               <p className="text-slate-500 font-medium text-lg">We combine the best of textbooks, videos, and quizzes into one app.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                     <Trophy size={32}/>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Gamified Quizzes</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">Earn coins and XP for every correct answer. Climb the leaderboard and unlock cool rewards in the shop.</p>
               </div>

               {/* Feature 2 */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                     <BookOpen size={32}/>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Smart Library</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">Access grade-specific textbooks and storybooks. Read anywhere, anytime with our built-in reader.</p>
               </div>

               {/* Feature 3 */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                     <Play size={32} className="ml-1"/>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Video Labs</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">Watch curated science experiments and computing tutorials in a safe, distraction-free cinema mode.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-20 px-6">
         <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
            
            <div className="relative z-10">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to start your streak?</h2>
               <p className="text-indigo-200 text-lg mb-10 font-medium max-w-xl mx-auto">Join thousands of students in Ghana making learning fun every single day.</p>
               <Link href="/register">
                  <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition shadow-xl hover:scale-105 transform duration-200">
                     Create Free Account
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 py-12">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
               <span className="text-xl font-black text-indigo-900 italic tracking-tighter">EW<span className="text-orange-500">.io</span></span>
               <span className="text-slate-400 font-bold text-sm ml-2">© 2026</span>
            </div>
            
            <div className="flex gap-8 text-sm font-bold text-slate-500">
               <Link href="#" className="hover:text-indigo-600 transition">About</Link>
               <Link href="#" className="hover:text-indigo-600 transition">Contact</Link>
               <Link href="/login" className="hover:text-indigo-600 transition">Teacher Login</Link>
               <Link href="/admin" className="text-orange-500 hover:text-orange-600 transition">Admin Portal</Link>
            </div>
         </div>
      </footer>

    </div>
  );
}
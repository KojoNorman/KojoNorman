import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Trophy, Rocket, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-600 italic tracking-tighter">
          E-WORKBOOK<span className="text-orange-500">.io</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-gray-500">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#curriculum" className="hover:text-blue-600 transition">Curriculum</a>
          <a href="#pricing" className="hover:text-blue-600 transition">For Schools</a>
        </div>
        <Link href="/dashboard">
          <button className="px-6 py-2 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition">
            Log In
          </button>
        </Link>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="px-8 py-20 text-center max-w-5xl mx-auto mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full font-bold text-sm mb-8 border border-orange-100">
          <Sparkles size={16} /> New: Basic 6 Computing Added!
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
          Make Homework <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Fun Again.</span>
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          The interactive learning platform that turns boring workbooks into gamified quests. 
          Master Science, Math, and Computing while earning XP and rewards.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2">
              Start Learning for Free <ArrowRight size={20} />
            </button>
          </Link>
          <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition">
            View Demo for Teachers
          </button>
        </div>
      </header>

      {/* 3. HERO IMAGE MOCKUP */}
      <div className="max-w-6xl mx-auto px-4 mb-32">
        <div className="bg-gray-900 rounded-[2.5rem] p-4 md:p-8 shadow-2xl ring-8 ring-gray-100 transform rotate-1 hover:rotate-0 transition duration-500">
           {/* We simulate a browser window here */}
           <div className="bg-gray-800 rounded-t-2xl h-8 flex items-center gap-2 px-4 mb-4">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
           </div>
           <div className="bg-white rounded-xl h-[300px] md:h-[500px] flex items-center justify-center bg-cover bg-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
                 <Trophy size={80} className="text-blue-200 mb-4 animate-bounce" />
                 <h3 className="text-2xl font-bold text-blue-900">Interactive Dashboard Preview</h3>
                 <p className="text-blue-400">Join 10,000+ Students</p>
              </div>
           </div>
        </div>
      </div>

      {/* 4. FEATURES GRID */}
      <section id="features" className="bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Students Love Us</h2>
            <p className="text-gray-500">We replaced "Submit PDF" with "Level Up".</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Brain className="text-purple-500" size={32} />}
              title="Smart Quizzes"
              desc="Instant feedback. No more waiting a week for the teacher to grade your paper."
            />
            <FeatureCard 
              icon={<Trophy className="text-yellow-500" size={32} />}
              title="Leagues & Rewards"
              desc="Compete with classmates and earn coins to customize your avatar."
            />
            <FeatureCard 
              icon={<Rocket className="text-blue-500" size={32} />}
              title="Curriculum Aligned"
              desc="Content designed specifically for the GES (Ghana Education Service) syllabus."
            />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center text-gray-400 text-sm">
        <p>© 2026 My E-Workbook Clone. Built with Next.js & Passion.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition hover:-translate-y-1">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
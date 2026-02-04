import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Trophy, Rocket, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-600 italic tracking-tighter">
          E-WORKBOOK<span className="text-orange-500">.io</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-gray-500">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#curriculum" className="hover:text-blue-600 transition">Curriculum</a>
        </div>
        <Link href="/login">
          <button className="px-6 py-2 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition">
            Log In
          </button>
        </Link>
      </nav>

      {/* HERO SECTION */}
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
          <Link href="/login">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2">
              Start Learning for Free <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </header>
    </div>
  );
}
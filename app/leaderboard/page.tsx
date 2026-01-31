'use client';

import React, { useState } from 'react';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import Link from 'next/link';

// Mock Data: The fake students we are competing against
const LEADERBOARD_DATA = [
  { rank: 1, name: "Sarah J.", xp: 2450, school: "Greenwood High", avatar: "👩‍🎓" },
  { rank: 2, name: "Michael K.", xp: 2300, school: "Riverside Academy", avatar: "👨‍💻" },
  { rank: 3, name: "Jessica T.", xp: 2150, school: "Hilltop School", avatar: "🦸‍♀️" },
  { rank: 4, name: "David L.", xp: 1900, school: "Sunnydale", avatar: "👨‍🚀" },
  { rank: 5, name: "You", xp: 1850, school: "Greenwood High", avatar: "S", isMe: true }, // This is us!
  { rank: 6, name: "Emily R.", xp: 1700, school: "Lakeside College", avatar: "👩‍🔬" },
  { rank: 7, name: "Chris P.", xp: 1500, school: "Mountain View", avatar: "🕵️‍♂️" },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'allTime'>('weekly');

  return (
    <div className="min-h-screen bg-indigo-50 font-sans text-gray-900 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full bg-indigo-600 p-8 pb-32 text-center text-white relative shadow-lg">
        <Link href="/" className="absolute top-6 left-6 text-indigo-200 hover:text-white transition flex items-center gap-2">
          <ArrowLeft size={20} /> Dashboard
        </Link>
        <h1 className="text-4xl font-black mb-2 flex justify-center items-center gap-3">
          <Trophy className="text-yellow-300" size={40} /> Leaderboard
        </h1>
        <p className="text-indigo-200">Top students in Basic 6 this week</p>
      </div>

      {/* LEADERBOARD CARD */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl -mt-20 overflow-hidden mb-10">
        
        {/* TABS */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-4 font-bold text-center transition ${activeTab === 'weekly' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            Weekly League
          </button>
          <button 
            onClick={() => setActiveTab('allTime')}
            className={`flex-1 py-4 font-bold text-center transition ${activeTab === 'allTime' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            All Time Legends
          </button>
        </div>

        {/* LIST */}
        <div className="p-4">
          {LEADERBOARD_DATA.map((student) => (
            <div 
              key={student.rank} 
              className={`flex items-center gap-4 p-4 rounded-2xl mb-2 transition-all hover:scale-[1.01] ${
                student.isMe ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : 'bg-white hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {/* Rank Number or Icon */}
              <div className="w-10 font-black text-xl text-center flex justify-center">
                {student.rank === 1 ? <Crown size={28} className="text-yellow-500 fill-yellow-500"/> : 
                 student.rank === 2 ? <Medal size={28} className="text-gray-400 fill-gray-400"/> : 
                 student.rank === 3 ? <Medal size={28} className="text-amber-600 fill-amber-600"/> : 
                 <span className={student.isMe ? 'text-white' : 'text-gray-400'}>#{student.rank}</span>}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                {student.avatar}
              </div>

              {/* Name & School */}
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{student.name} {student.isMe && "(You)"}</h3>
                <p className={`text-xs ${student.isMe ? 'text-indigo-200' : 'text-gray-400'}`}>{student.school}</p>
              </div>

              {/* XP Score */}
              <div className="font-mono font-bold text-lg">
                {student.xp} <span className="text-sm opacity-70">XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
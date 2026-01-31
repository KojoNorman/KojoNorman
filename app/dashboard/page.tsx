import React from 'react';
import Link from 'next/link'; // <--- I added this import for you
import { Flame, Trophy, BookOpen, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* 1. SIDEBAR (Navigation) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-black text-blue-600 mb-10 italic tracking-tighter">
          E-WORKBOOK<span className="text-orange-500">.io</span>
        </h1>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<BookOpen size={20}/>} label="My Subjects" />
          <Link href="/leaderboard">
  <NavItem icon={<Trophy size={20}/>} label="Leaderboard" />
</Link>
          <Link href="/shop">
          <NavItem icon={<ShoppingCart size={20}/>} label="Item Shop" />
</Link>
        </nav>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 mt-auto p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
            S
          </div>
          <div className="text-sm">
            <p className="font-bold">Student User</p>
            <p className="text-gray-400 text-xs">Basic 6</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h2 className="font-bold text-xl text-gray-800">Ready to learn? 🚀</h2>
            <p className="text-gray-400 text-xs">Let's keep that streak alive!</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
              <Flame size={20} fill="currentColor" /> 
              <span>5 Days</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <Trophy size={20} /> 
              <span>Lvl 12</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE */}
        <section className="p-8 overflow-y-auto">
          
          {/* Banner */}
          {/* Grid of Workbooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WorkbookCard 
              title="General Science" 
              topic="Nature & Ecosystems" 
              progress={75} 
              color="bg-green-500"
              icon="🌱"
              link="/quiz"  // <--- Kept this as the original quiz
            />
            <WorkbookCard 
              title="Computing" 
              topic="Hardware Basics" 
              progress={30} 
              color="bg-purple-500"
              icon="💻"
              link="/computing" // <--- Pointing to a new page
            />
            <WorkbookCard 
              title="Mathematics" 
              topic="Fractions & Decimals" 
              progress={10} 
              color="bg-blue-500"
              icon="📐"
              link="/math" // <--- Pointing to a new page
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

// I have updated this function below to include the Link!
// REPLACE THE OLD WorkbookCard FUNCTION WITH THIS:
function WorkbookCard({ title, topic, progress, color, icon, link }: any) {
  return (
    <Link href={link || '#'}>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
            {icon}
          </div>
          <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:text-blue-500 transition-colors">
            <BookOpen size={16} />
          </div>
        </div>
        
        <h4 className="font-bold text-lg text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-400 text-sm mb-6">{topic}</p>
        
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Link>
  );
}
        
  
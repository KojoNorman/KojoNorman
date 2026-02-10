'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Play, Monitor, Beaker, Scissors, X, Loader2, Video, Calculator, Palette } from 'lucide-react';

export default function ScienceLabsPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  
  // --- STATE: Merged Old & New ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All"); // New Feature
  const [watchingVideo, setWatchingVideo] = useState<any | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setVideos(data);
    setLoading(false);
  }

  // --- FILTER LOGIC (Enhanced) ---
  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === "All" || v.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesGrade = gradeFilter === "All" || v.grade_level === gradeFilter || v.grade_level === 'all';
    return matchesCategory && matchesGrade;
  });

  // Helper for dynamic icons
  const getCategoryIcon = (cat: string) => {
    switch(cat.toLowerCase()) {
      case 'science': return <Beaker size={18}/>;
      case 'computing': return <Monitor size={18}/>;
      case 'math': return <Calculator size={18}/>;
      case 'crafts': return <Palette size={18}/>; // Mapped Scissors/Palette
      default: return <Video size={18}/>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0FDFA]"><Loader2 className="animate-spin text-teal-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#F0FDFA] font-sans p-6 md:p-10">
      
      {/* HEADER (Old Layout + New Grade Filter) */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="bg-white p-3 rounded-full shadow-sm text-teal-900 hover:bg-teal-100 transition">
                <ArrowLeft size={24}/>
            </Link>
            <div>
                <h1 className="text-4xl font-black text-teal-950 tracking-tight">Science Labs</h1>
                <p className="text-teal-800/60 font-bold text-sm">Watch, Learn, and Experiment.</p>
            </div>
        </div>

        {/* New Feature: Grade Filter (Styled to match Teal Theme) */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-teal-100 flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-black text-teal-300 uppercase pl-3">Grade:</span>
            <select 
               value={gradeFilter} 
               onChange={(e) => setGradeFilter(e.target.value)}
               className="bg-transparent font-bold text-teal-900 p-2 cursor-pointer focus:outline-none"
            >
               <option value="All">All Grades</option>
               {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
        </div>
      </div>

      {/* FILTER TABS (Old Design + New Categories) */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap gap-3">
         {['All', 'Science', 'Computing', 'Math', 'Crafts'].map(cat => (
            <CategoryTab 
                key={cat}
                label={cat === 'All' ? 'All Videos' : cat} 
                icon={getCategoryIcon(cat)} 
                active={activeCategory === cat || (cat === 'All' && activeCategory === 'All')} 
                onClick={() => setActiveCategory(cat)} 
            />
         ))}
      </div>

      {/* VIDEO GRID (Old Design Style) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-20">
               <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-400">
                  <Video size={40}/>
               </div>
               <p className="text-teal-400 font-bold text-lg">No videos found for this grade/category.</p>
            </div>
         ) : (
            filteredVideos.map((video) => (
               <div 
                 key={video.id} 
                 onClick={() => setWatchingVideo(video)}
                 className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-teal-100 border-2 border-transparent hover:border-teal-300 transition-all cursor-pointer hover:-translate-y-2"
               >
                 {/* Thumbnail */}
                 <div className="aspect-video bg-black relative">
                     <img 
                       src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`} 
                       alt={video.title} 
                       className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <Play size={20} className="text-teal-600 ml-1 fill-teal-600"/>
                           </div>
                        </div>
                     </div>
                     <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        {video.grade_level === 'all' ? 'All Ages' : video.grade_level}
                     </div>
                 </div>

                 {/* Info */}
                 <div className="p-5">
                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-2 bg-teal-50 text-teal-600`}>
                        {video.category}
                     </span>
                     <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-teal-700 transition-colors">
                        {video.title}
                     </h3>
                 </div>
               </div>
            ))
         )}
      </div>

      {/* --- CINEMA MODE (New Modal Features) --- */}
      {watchingVideo && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl relative">
               
               {/* Close Button */}
               <button 
                  onClick={() => setWatchingVideo(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition backdrop-blur-md"
               >
                  <X size={24}/>
               </button>

               {/* Improved Video Player */}
               <div className="aspect-video w-full bg-black">
                  <iframe 
                     src={`https://www.youtube.com/embed/${watchingVideo.video_id}?autoplay=1&rel=0`} 
                     title={watchingVideo.title}
                     className="w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen
                  />
               </div>

               {/* Video Info (New Design) */}
               <div className="p-6 md:p-8 bg-slate-900 text-white">
                  <h2 className="text-2xl font-black mb-2">{watchingVideo.title}</h2>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                     <span className="uppercase tracking-widest">{watchingVideo.category}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                     <span>For {watchingVideo.grade_level === 'all' ? 'Everyone' : watchingVideo.grade_level}</span>
                  </div>
               </div>

            </div>
         </div>
      )}

    </div>
  );
}

// Helper Tab (Old Visual Style)
function CategoryTab({label, icon, active, onClick}: any) {
   return (
      <button 
         onClick={onClick}
         className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all border-2
            ${active 
               ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200' 
               : 'bg-white border-teal-100 text-teal-800 hover:border-teal-300 hover:bg-teal-50'
            }`}
      >
         {icon} {label}
      </button>
   );
}
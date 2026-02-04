'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Play, Beaker, Scissors, Loader2, Monitor } from 'lucide-react';

export default function LabsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [studentGrade, setStudentGrade] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'science', 'crafts', 'computing'

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    // 1. Get User Grade
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('grade_level')
      .eq('id', user.id)
      .single();

    if (profile?.grade_level) {
      setStudentGrade(profile.grade_level);

      // 2. Fetch Videos (Matching Grade OR 'all')
      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .or(`grade_level.eq.${profile.grade_level},grade_level.eq.all`);

      if (videoData) setVideos(videoData);
    }
    setLoading(false);
  }

  // Filter Logic
  const filteredVideos = filter === 'all' 
    ? videos 
    : videos.filter(v => v.category === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-red-50 font-sans p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Labs & Crafts 🧪</h1>
          <p className="text-red-500 font-bold bg-red-100 px-4 py-1 rounded-full inline-block mt-2">
            Watch, Learn & Create
          </p>
        </div>
        <div className="w-32 hidden md:block"></div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-center gap-3 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Videos', icon: <Play size={16}/> },
          { id: 'science', label: 'Science Labs', icon: <Beaker size={16}/> },
          { id: 'crafts', label: 'DIY Crafts', icon: <Scissors size={16}/> },
          { id: 'computing', label: 'Tech', icon: <Monitor size={16}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap border-2
              ${filter === tab.id 
                ? 'bg-red-600 text-white border-red-600 shadow-lg scale-105' 
                : 'bg-white text-gray-500 border-transparent hover:bg-white/80'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* VIDEO GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            
            {/* YOUTUBE EMBED */}
            <div className="relative pb-[56.25%] h-0 bg-gray-900">
              <iframe 
                src={`https://www.youtube.com/embed/${video.video_id}`}
                className="absolute top-0 left-0 w-full h-full"
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md text-white
                  ${video.category === 'science' ? 'bg-teal-500' : 
                    video.category === 'crafts' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                  {video.category}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-md">
                  {video.grade_level === 'all' ? 'All Ages' : video.grade_level}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
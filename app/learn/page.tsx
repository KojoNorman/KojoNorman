'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, BookOpen, Video, Loader2, Lock } from 'lucide-react';

export default function LearnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [studentGrade, setStudentGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    // 1. Get Current User & Their Grade
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('grade_level')
      .eq('id', user.id)
      .single();

    if (profile?.grade_level) {
      setStudentGrade(profile.grade_level);
      
      // 2. Fetch Lessons ONLY for their Grade
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('grade_level', profile.grade_level); // <--- THE NACCA FILTER 🇬🇭

      if (lessonData) setLessons(lessonData);
    }
    setLoading(false);
  }

  // Filter by subject tabs
  const filteredLessons = selectedSubject === 'all' 
    ? lessons 
    : lessons.filter(l => l.subject === selectedSubject);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-sky-50 font-sans p-6">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">My Library 📚</h1>
          <p className="text-blue-600 font-bold bg-blue-100 px-4 py-1 rounded-full inline-block mt-2">
            {studentGrade} Curriculum
          </p>
        </div>
        
        <div className="w-32 hidden md:block"></div> {/* Spacer */}
      </div>

      {/* SUBJECT TABS */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-center gap-2 overflow-x-auto pb-2">
        {['all', 'math', 'science', 'computing'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-6 py-2 rounded-full font-bold capitalize transition-all whitespace-nowrap
              ${selectedSubject === sub 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'bg-white text-gray-400 hover:bg-white/80'}`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* LESSONS GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              
              {/* IMAGE / THUMBNAIL */}
              <div className="h-40 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
                {lesson.image_url ? (
                  <img src={lesson.image_url} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={40}/></div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold uppercase text-gray-500 shadow-sm">
                  {lesson.subject}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </h3>
              
              <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                {lesson.content}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                  <BookOpen size={16} /> Read
                </button>
                {lesson.video_url && (
                   <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                     <Video size={14} /> Video Lab
                   </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400">
            <Lock size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No Lessons Found for {studentGrade}</h3>
            <p>Try changing your grade in Settings to see sample content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
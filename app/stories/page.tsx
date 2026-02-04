'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Book, Loader2, Star, User } from 'lucide-react';

export default function StoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [studentGrade, setStudentGrade] = useState("");
  const [readingStory, setReadingStory] = useState<any>(null); // To open a specific book

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('grade_level')
      .eq('id', user.id)
      .single();

    if (profile?.grade_level) {
      setStudentGrade(profile.grade_level);

      // Fetch stories for Grade OR 'all'
      const { data: storyData } = await supabase
        .from('stories')
        .select('*')
        .or(`grade_level.eq.${profile.grade_level},grade_level.eq.all`);

      if (storyData) setStories(storyData);
    }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40}/></div>;

  // --- VIEW MODE: READING A SPECIFIC STORY ---
  if (readingStory) {
    return (
      <div className="min-h-screen bg-orange-50 font-serif p-6 md:p-12">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl border-4 border-orange-100">
          <button onClick={() => setReadingStory(null)} className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-sans font-bold mb-8 transition">
            <ArrowLeft size={20} /> Close Book
          </button>
          
          <h1 className="text-4xl font-black text-gray-900 mb-2">{readingStory.title}</h1>
          <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-widest mb-8">
            <User size={16}/> {readingStory.author}
          </div>

          <div className="prose prose-lg text-gray-700 leading-loose">
            {readingStory.content.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
             <button onClick={() => setReadingStory(null)} className="px-8 py-3 bg-orange-500 text-white font-sans font-bold rounded-full hover:bg-orange-600 transition shadow-lg shadow-orange-200">
               Finish Reading
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW MODE: BOOKSHELF ---
  return (
    <div className="min-h-screen bg-amber-50 font-sans p-6">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Story Time 🦁</h1>
          <p className="text-orange-600 font-bold bg-orange-100 px-4 py-1 rounded-full inline-block mt-2">
            Tales for {studentGrade}
          </p>
        </div>
        <div className="w-32 hidden md:block"></div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div key={story.id} onClick={() => setReadingStory(story)} className="bg-white rounded-r-2xl rounded-l-md p-6 shadow-md border-l-8 border-l-orange-600 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full">
            
            {/* BOOK COVER LOOK */}
            <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden relative shadow-inner">
               {story.cover_url ? (
                 <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-orange-200"><Book size={60}/></div>
               )}
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{story.title}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By {story.author}</p>
            
            <p className="text-gray-500 text-sm line-clamp-3 mb-6">
              {story.content}
            </p>

            <div className="mt-auto flex items-center justify-between">
               <span className="flex items-center gap-1 text-orange-500 font-bold text-xs"><Star size={14}/> Top Pick</span>
               <button className="text-gray-900 font-bold text-sm bg-orange-100 px-4 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors">
                 Read Now
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
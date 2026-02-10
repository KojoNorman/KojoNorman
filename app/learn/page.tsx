'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, BookOpen, Calculator, Beaker, Monitor, X, Book, Loader2, Feather, Lightbulb, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'textbooks' | 'stories'>('textbooks');
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [gradeFilter, setGradeFilter] = useState("All");
  
  const [readingItem, setReadingItem] = useState<any | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    const { data: lessonData } = await supabase.from('lessons').select('*').order('created_at', { ascending: false });
    const { data: storyData } = await supabase.from('stories').select('*').order('created_at', { ascending: false });

    if (lessonData) setLessons(lessonData);
    if (storyData) setStories(storyData);
    setLoading(false);
  }

  const filteredLessons = gradeFilter === "All" ? lessons : lessons.filter(l => l.grade_level === gradeFilter);
  const filteredStories = gradeFilter === "All" ? stories : stories.filter(s => s.grade_level === gradeFilter || s.grade_level === 'all');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF6F0]"><Loader2 className="animate-spin text-orange-500" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#FDF6F0] font-sans p-6 md:p-10">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <Link href="/dashboard" className="bg-white p-3 rounded-full shadow-sm text-orange-900 hover:bg-orange-100 transition"><ArrowLeft size={24}/></Link>
            <div>
               <h1 className="text-4xl font-black text-orange-950 tracking-tight">My Library</h1>
               <p className="text-orange-800/60 font-bold text-sm">Read, Learn, and Explore.</p>
            </div>
         </div>
         <div className="bg-white p-1 rounded-xl shadow-sm border border-orange-100 flex items-center gap-2">
            <span className="text-xs font-black text-orange-300 uppercase pl-3">Filter:</span>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="bg-transparent font-bold text-orange-900 p-2 cursor-pointer focus:outline-none">
               <option value="All">All Grades</option>
               {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
         </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto mb-10 flex gap-4 border-b-2 border-orange-100 pb-1">
         <button onClick={() => setActiveTab('textbooks')} className={`pb-3 px-2 font-black text-lg flex items-center gap-2 transition-all border-b-4 ${activeTab === 'textbooks' ? 'text-orange-600 border-orange-500' : 'text-orange-300 border-transparent hover:text-orange-400'}`}><BookOpen size={20}/> Textbooks</button>
         <button onClick={() => setActiveTab('stories')} className={`pb-3 px-2 font-black text-lg flex items-center gap-2 transition-all border-b-4 ${activeTab === 'stories' ? 'text-pink-600 border-pink-500' : 'text-orange-300 border-transparent hover:text-orange-400'}`}><Feather size={20}/> Storybooks</button>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto">
         {activeTab === 'textbooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredLessons.length === 0 ? <div className="col-span-full text-center py-20 text-orange-300 font-bold">No textbooks found.</div> : filteredLessons.map((lesson) => (
                  <div key={lesson.id} onClick={() => setReadingItem(lesson)} className="group bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-100 border-2 border-transparent hover:border-orange-200 transition-all cursor-pointer hover:-translate-y-1 relative overflow-hidden">
                     <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>{lesson.subject === 'math' ? <Calculator size={100}/> : lesson.subject === 'science' ? <Beaker size={100}/> : <Monitor size={100}/>}</div>
                     <div className="relative z-10">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${lesson.subject === 'math' ? 'bg-orange-100 text-orange-600' : lesson.subject === 'science' ? 'bg-teal-100 text-teal-600' : 'bg-purple-100 text-purple-600'}`}>{lesson.subject}</span>
                        <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 line-clamp-2">{lesson.title}</h3>
                        <p className="text-slate-400 text-sm font-bold uppercase">{lesson.grade_level}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
         {activeTab === 'stories' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {filteredStories.length === 0 ? <div className="col-span-full text-center py-20 text-orange-300 font-bold">No stories found.</div> : filteredStories.map((story) => (
                  <div key={story.id} onClick={() => setReadingItem(story)} className="group cursor-pointer">
                     <div className="aspect-[2/3] bg-slate-200 rounded-2xl mb-4 overflow-hidden shadow-md relative transition-transform hover:-translate-y-2 hover:shadow-xl">
                        {story.cover_url ? <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-pink-100 flex items-center justify-center flex-col p-4 text-center"><Book size={32} className="text-pink-300 mb-2"/><span className="text-pink-400 font-black text-xs uppercase">No Cover</span></div>}
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm leading-tight text-center">{story.title}</h3>
                     <p className="text-slate-400 text-xs text-center mt-1 font-medium">{story.author}</p>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* --- SMART READER (THEME ENGINE) --- */}
      {readingItem && (
         <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
            <div className="min-h-screen max-w-4xl mx-auto bg-white shadow-2xl min-h-screen relative">
               
               {/* Reader Toolbar */}
               <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-10">
                  <div>
                     <h2 className="font-black text-slate-800 text-lg truncate max-w-[200px] md:max-w-md">{readingItem.title}</h2>
                     <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">{readingItem.subject || "Storybook"}</p>
                  </div>
                  <button onClick={() => setReadingItem(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-600"><X size={24}/></button>
               </div>

               <div className="p-8 md:p-16 text-slate-800 max-w-3xl mx-auto pb-32">
                  {readingItem.image_url && <img src={readingItem.image_url} alt="Header" className="w-full h-64 md:h-80 object-cover rounded-3xl mb-12 shadow-2xl"/>}
                  
                  {/* === THEME ENGINE: CUSTOM MARKDOWN STYLES === */}
                  <ReactMarkdown
                    components={{
                        // 1. Body Text
                        p: (props) => <p className="mb-6 font-serif text-lg md:text-xl leading-loose text-slate-700" {...props} />,
                        
                        // 2. Headings
                        h1: (props) => <h1 className="text-3xl md:text-4xl font-black mt-12 mb-6 text-indigo-900 border-b-4 border-indigo-100 pb-2" {...props} />,
                        h2: (props) => <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-800 flex items-center gap-2 border-l-4 border-orange-400 pl-4" {...props} />,
                        h3: (props) => <h3 className="text-xl font-bold mt-8 mb-3 text-indigo-600" {...props} />,

                        // 3. Lists
                        ul: (props) => <ul className="list-none pl-4 mb-6 space-y-2" {...props} />,
                        li: ({children, ...props}) => (
                            <li className="flex items-start gap-3 font-serif text-lg text-slate-700" {...props}>
                                <div className="mt-2 w-2 h-2 rounded-full bg-indigo-400 shrink-0"></div>
                                <span>{children}</span>
                            </li>
                        ),

                        // 4. "The Magic Box" (Blockquotes -> Key Concepts)
                        // FIXED: Changed div to blockquote to match TypeScript prop requirements
                        blockquote: (props) => (
                            <blockquote className="my-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden" {...props}>
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Lightbulb size={100} className="text-indigo-600"/></div>
                                <div className="flex gap-4 relative z-10">
                                    <div className="shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Info size={20}/></div>
                                    <div>
                                        <h4 className="font-bold text-indigo-900 uppercase text-xs tracking-widest mb-1">Key Insight</h4>
                                        <div className="font-serif text-lg text-indigo-900 italic leading-relaxed">
                                            {props.children}
                                        </div>
                                    </div>
                                </div>
                            </blockquote>
                        ),

                        // 5. Diagrams
                        img: (props) => (
                            <div className="my-10 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                <img className="w-full rounded-2xl shadow-sm" {...props} />
                                {props.alt && (
                                    <div className="text-center mt-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wide">
                                        <span className="w-10 h-[1px] bg-slate-300"></span>
                                        {props.alt}
                                        <span className="w-10 h-[1px] bg-slate-300"></span>
                                    </div>
                                )}
                            </div>
                        ),

                        // 6. Highlights & Code
                        strong: (props) => <strong className="font-black text-indigo-700 bg-indigo-50 px-1 rounded" {...props} />,
                        code: (props) => <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200" {...props} />
                    }}
                  >
                    {readingItem.content}
                  </ReactMarkdown>

                  <div className="mt-16 pt-16 border-t border-slate-100 text-center">
                     <button onClick={() => setReadingItem(null)} className="px-10 py-4 bg-slate-900 text-white rounded-full font-sans font-bold text-lg hover:bg-black transition shadow-xl shadow-slate-200 hover:-translate-y-1">
                        Complete Lesson
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
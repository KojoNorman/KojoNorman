'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// FIX 1: Go up 3 levels to reach 'lib'
import { supabase } from '../../../lib/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2, Brain, BookOpen } from 'lucide-react';
// FIX 1: Go up 3 levels to reach 'lib'
import useGameSounds from '../../../lib/useGameSounds';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function DynamicSubjectPage() {
  const params = useParams();
  
  // 1. Get the subject from the URL (e.g., 'mathematics', 'english')
  // Decode converts "%20" back to spaces if needed
  const subjectName = decodeURIComponent(params.subject as string);

  const { playCorrect, playWrong, playClick } = useGameSounds();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // User Profile Data
  const [userGrade, setUserGrade] = useState("Class 1");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [subjectName]); // Re-run if subject changes

  async function fetchQuestions() {
    setLoading(true);
    
    // Get User Grade
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
       setUserId(user.id);
       const { data: profile } = await supabase.from('profiles').select('grade_level').eq('id', user.id).single();
       if (profile) setUserGrade(profile.grade_level);

       // Fetch Questions for this Subject + Grade
       // Note: We use .ilike() for case-insensitive matching (Math vs math)
       const { data: qData } = await supabase
         .from('questions')
         .select('*')
         .ilike('subject', subjectName) 
         .eq('grade_level', profile?.grade_level || 'Class 1');

       if (qData && qData.length > 0) {
         setQuestions(qData.sort(() => 0.5 - Math.random()).slice(0, 10));
       }
    }
    setLoading(false);
  }

  const handleAnswer = async (option: string) => {
    // FIX 2: Call function directly since it doesn't need arguments here
    if (playClick) playClick(); 
    
    setSelectedOpt(option);
    const correct = option === questions[currentQ].answer;
    setIsCorrect(correct);

    if (correct) {
      if (playCorrect) playCorrect();
      setScore(s => s + 1);
      // Award Coins (Instant Reward)
      if (userId) {
        await supabase.rpc('increment_coins', { x: 10, row_id: userId });
        await supabase.rpc('increment_xp', { x: 5, row_id: userId });
      }
    } else {
      if (playWrong) playWrong();
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  // --- NO QUESTIONS FOUND STATE ---
  if (questions.length === 0) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
           <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-400">
              <Brain size={48}/>
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-2 capitalize">{subjectName}</h2>
           <p className="text-slate-500 font-bold max-w-md">
              We couldn't find any questions for <span className="text-indigo-600">{userGrade}</span> in this subject yet.
           </p>
           <Link href="/dashboard" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition">
              Back to Dashboard
           </Link>
        </div>
     );
  }

  // --- RESULTS SCREEN ---
  if (showResult) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Practice Complete!</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest mb-8">{subjectName}</p>
          
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" />
              <circle cx="80" cy="80" r="70" stroke="#4f46e5" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * score) / questions.length} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute text-5xl font-black text-slate-800">{Math.round((score/questions.length)*100)}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-green-50 p-4 rounded-2xl">
                <span className="block text-2xl font-black text-green-600">+{score * 10}</span>
                <span className="text-xs font-bold text-green-400 uppercase">Coins Earned</span>
             </div>
             <div className="bg-blue-50 p-4 rounded-2xl">
                <span className="block text-2xl font-black text-blue-600">+{score * 5}</span>
                <span className="text-xs font-bold text-blue-400 uppercase">XP Gained</span>
             </div>
          </div>

          <Link href="/dashboard" className="block w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition mb-3">
             Return Home
          </Link>
          <button onClick={() => window.location.reload()} className="block w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">
             Practice Again
          </button>
        </div>
      </div>
    );
  }

  // --- QUIZ UI ---
  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto w-full">
        {/* FIX 3: Wrap playClick in an anonymous function */}
        <Link href="/dashboard" onClick={() => { if(playClick) playClick() }} className="p-3 bg-white rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition">
          <ArrowLeft size={24}/>
        </Link>
        <div className="bg-white px-6 py-2 rounded-full shadow-sm font-black text-slate-700 uppercase tracking-widest text-sm flex items-center gap-2">
           <BookOpen size={16} className="text-indigo-500"/> {subjectName}
        </div>
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentQ) / questions.length) * 100}%` }}></div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
         <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-indigo-100 border border-slate-100 relative overflow-hidden">
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-10 text-center">
               <Latex>{q.question}</Latex>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {['a', 'b', 'c', 'd'].filter(opt => q[opt]).map((opt) => { // Only show options that exist
                const isSelected = selectedOpt === opt;
                const isWinner = isCorrect && isSelected;
                const isLoser = isCorrect === false && isSelected;

                return (
                  <button
                    key={opt}
                    disabled={selectedOpt !== null}
                    onClick={() => handleAnswer(opt)}
                    className={`p-5 rounded-2xl font-bold text-lg text-left transition-all transform active:scale-95 border-2 flex items-center justify-between
                      ${isSelected 
                        ? (isWinner ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white')
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white hover:shadow-md'
                      }
                    `}
                  >
                    <span className="flex items-center gap-4">
                       <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase 
                          ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}
                       `}>
                          {opt}
                       </span>
                       <Latex>{q[opt]}</Latex>
                    </span>
                    
                    {isWinner && <CheckCircle className="animate-in zoom-in"/>}
                    {isLoser && <XCircle className="animate-in zoom-in"/>}
                  </button>
                );
              })}
            </div>

         </div>
      </div>

    </div>
  );
}
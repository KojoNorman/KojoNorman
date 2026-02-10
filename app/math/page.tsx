'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Loader2, Trophy, RotateCcw, Calculator, CheckCircle, XCircle } from 'lucide-react';

// --- MATH ENGINE ---
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function MathQuiz() {
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [question, setQuestion] = useState<any>(null);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [userGrade, setUserGrade] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // 2. Get Profile (Grade Level)
    const { data: profile } = await supabase.from('profiles').select('grade_level').eq('id', user.id).single();
    
    if (profile) {
      setUserGrade(profile.grade_level);

      // 3. Fetch Math Questions for THIS Grade
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', 'math')
        .eq('grade_level', profile.grade_level) // <--- STRICT GRADE FILTER
        .eq('is_daily', false);

      if (data && data.length > 0) {
        setAllQuestions(data);
        pickNewQuestion(data, []);
      }
    }
    setLoading(false);
  }

  const pickNewQuestion = (questions: any[], seen: number[]) => {
    const available = questions.filter(q => !seen.includes(q.id));
    if (available.length > 0) {
      const randomIdx = Math.floor(Math.random() * available.length);
      setQuestion(available[randomIdx]);
      setSeenIds([...seen, available[randomIdx].id]);
    } else {
      setIsFinished(true);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowResult(false);
    pickNewQuestion(allQuestions, seenIds);
  };

  const handleAnswer = async (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    setShowResult(true);

    if (choice === question.answer) {
      setCorrectCount(c => c + 1);
      // Update XP & Coins
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('xp, coins').eq('id', user.id).single();
        if (profile) {
          await supabase.from('profiles').update({ 
            xp: profile.xp + 10, 
            coins: profile.coins + 5 
          }).eq('id', user.id);
        }
      }
    }

    // Auto-advance
    setTimeout(() => { nextQuestion(); }, 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]"><Loader2 className="animate-spin text-orange-500" size={48} /></div>;

  // --- FINISH SCREEN ---
  if (isFinished) return (
    <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-orange-200 max-w-md w-full border border-orange-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-amber-500"></div>
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <Trophy size={48} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Workbook Complete!</h1>
        <p className="text-slate-500 font-medium mb-8">You scored <span className="text-orange-600 font-bold">{correctCount}</span> out of <span className="font-bold">{allQuestions.length}</span></p>
        
        <button onClick={() => router.back()} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg transform active:scale-95">
           <RotateCcw size={20}/> Return to Dashboard
        </button>
      </div>
    </div>
  );

  // --- EMPTY STATE ---
  if (!question) return (
    <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center p-6">
       <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md">
          <Calculator size={64} className="text-orange-200 mx-auto mb-4"/>
          <h2 className="text-2xl font-black text-slate-800">No Questions Yet</h2>
          <p className="text-slate-400 mt-2">There are no math questions uploaded for <span className="font-bold text-orange-500">{userGrade}</span>.</p>
          <button onClick={() => router.back()} className="mt-8 text-slate-500 font-bold hover:text-orange-500">Go Back</button>
       </div>
    </div>
  );

  const progressPercentage = (seenIds.length / allQuestions.length) * 100;

  // --- QUIZ UI ---
  return (
    <div className="min-h-screen bg-[#FFF7ED] p-6 font-sans flex flex-col">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="bg-white p-3 rounded-full shadow-sm text-orange-900 hover:bg-orange-100 transition">
           <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-orange-100 shadow-sm">
           <Calculator size={18} className="text-orange-500"/>
           <span className="font-bold text-orange-900 text-sm tracking-wide">{userGrade} Math</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-100 border border-orange-50 relative overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-orange-50 h-2 w-full">
               <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div className="p-8 md:p-12">
               {/* Question Header */}
               <div className="flex justify-between items-center mb-6">
                  <span className="text-orange-300 font-black text-xs uppercase tracking-[0.2em]">Question {seenIds.length}</span>
                  <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                     +10 XP
                  </div>
               </div>

               {/* The Question (with LaTeX support) */}
               <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-10 leading-snug">
                  <Latex>{question.question}</Latex>
               </h2>

               {/* Options */}
               <div className="space-y-4">
                 {['a', 'b', 'c'].map((opt) => {
                    const isSelected = selected === opt;
                    const isCorrect = opt === question.answer;
                    const showCorrectness = showResult && isCorrect;
                    const showWrongness = showResult && isSelected && !isCorrect;

                    let btnStyle = "bg-white border-2 border-slate-100 text-slate-600 hover:border-orange-200 hover:bg-orange-50";
                    if (showCorrectness) btnStyle = "bg-green-50 border-2 border-green-500 text-green-700";
                    else if (showWrongness) btnStyle = "bg-red-50 border-2 border-red-500 text-red-700";
                    else if (showResult && !isCorrect) btnStyle = "opacity-50 grayscale"; // Dim other options

                    return (
                      <button 
                        key={opt} 
                        disabled={showResult} 
                        onClick={() => handleAnswer(opt)} 
                        className={`w-full text-left p-5 rounded-2xl font-bold text-lg transition-all flex items-center gap-5 group ${btnStyle}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black uppercase transition-colors 
                           ${showCorrectness ? 'bg-green-500 text-white' : 
                             showWrongness ? 'bg-red-500 text-white' : 
                             'bg-slate-100 text-slate-400 group-hover:bg-orange-200 group-hover:text-orange-700'}`}>
                           {opt}
                        </div>
                        <span className="flex-1"><Latex>{question[opt]}</Latex></span>
                        {showCorrectness && <CheckCircle className="text-green-500" size={24}/>}
                        {showWrongness && <XCircle className="text-red-500" size={24}/>}
                      </button>
                    );
                 })}
               </div>
            </div>
            
            {/* Feedback Footer */}
            {showResult && (
               <div className={`p-4 text-center font-bold text-sm uppercase tracking-widest animate-in slide-in-from-bottom-5 fade-in duration-300
                  ${selected === question.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selected === question.answer ? "🎉 Awesome! Correct Answer." : `😅 Oops! The answer was ${question.answer.toUpperCase()}`}
               </div>
            )}
        </div>
      </div>

    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import useGameSounds from '../../lib/useGameSounds';
import { CheckCircle, XCircle, Trophy, Loader2, ArrowLeft, CalendarOff } from 'lucide-react';
// import confetti from 'canvas-confetti'; 

// ✅ IMPORT MATH STYLES
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function DailyChallenge() {
  const router = useRouter();
  const { playCorrect, playWrong, playCash } = useGameSounds();
  
  const [loading, setLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, []);

  // 🔒 LOGIC FIX: Check Database, not LocalStorage
  async function checkEligibility() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const today = new Date().toISOString().split('T')[0]; 

    const { data: profile } = await supabase
      .from('profiles')
      .select('last_daily_date')
      .eq('id', user.id)
      .single();

    if (profile?.last_daily_date === today) {
      setAlreadyPlayed(true);
      setLoading(false);
    } else {
      fetchDailyQuestions();
    }
  }

  async function fetchDailyQuestions() {
    const { data } = await supabase.from('questions').select('*').eq('is_daily', true).limit(5);

    if (!data || data.length < 5) {
        const { data: fallback } = await supabase.from('questions').select('*').limit(5);
        setQuestions(fallback || []);
    } else {
        setQuestions(data);
    }
    setLoading(false);
  }

  const handleAnswer = (option: string) => {
    if (showResult) return; 
    setSelectedAnswer(option);
    setShowResult(true);

    const correct = option === questions[currentIndex].answer;
    if (correct) {
      setScore(score + 1);
      playCorrect();
    } else {
      playWrong();
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = async () => {
    setFinished(true);
    playCash();
    // confetti({ particleCount: 150 }); 

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const today = new Date().toISOString().split('T')[0];
        
        await supabase
            .from('profiles')
            .update({ last_daily_date: today })
            .eq('id', user.id);
        
        await supabase.rpc('increment_xp', { x: 50, row_id: user.id });
        await supabase.rpc('increment_coins', { x: score * 10, row_id: user.id });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  // --- ALREADY PLAYED SCREEN ---
  if (alreadyPlayed) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarOff size={48}/>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Come Back Tomorrow!</h1>
                <p className="text-slate-500 font-medium mb-8">
                    You have already completed today's challenge. <br/>
                    Return tomorrow for more rewards!
                </p>
                <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-black transition">
                    Back to Dashboard
                </button>
            </div>
        </div>
      )
  }

  // --- RESULTS SCREEN ---
  if (finished) {
    return (
        <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 font-sans">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Trophy size={48} className="text-yellow-600"/>
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Challenge Complete!</h1>
                <p className="text-slate-500 font-bold mb-8">You scored {score} out of {questions.length}</p>
                
                <div className="flex gap-4 justify-center mb-8">
                    <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-xl font-black shadow-sm">+50 XP</div>
                    <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-xl font-black shadow-sm">+{score * 10} Coins</div>
                </div>

                <button onClick={() => router.push('/dashboard')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
  }

  // --- GAME SCREEN ---
  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">No questions available right now.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400 font-black text-sm uppercase tracking-wider">Question {currentIndex + 1} / {questions.length}</span>
                <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 font-bold transition"><ArrowLeft size={18}/> Quit</button>
            </div>
            
            {/* Progress Bar */}
            <div className="h-4 bg-slate-200 rounded-full w-full mb-10 overflow-hidden border border-slate-300/50">
                <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200 mb-8 min-h-[220px] flex items-center justify-center text-center relative overflow-hidden border-b-8 border-slate-100">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                    {/* ✅ RENDER MATH QUESTION */}
                    <Latex>{currentQ.question}</Latex>
                </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQ.answer;
                    
                    let buttonStyle = "bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 border-b-4 border-slate-200"; 
                    
                    if (showResult) {
                        if (isCorrect) buttonStyle = "bg-green-500 text-white border-green-600 ring-4 ring-green-200 border-b-4 border-green-700 shadow-lg"; 
                        else if (isSelected) buttonStyle = "bg-red-500 text-white border-red-600 border-b-4 border-red-700 opacity-100"; 
                        else buttonStyle = "bg-slate-100 text-slate-300 opacity-50 border-transparent cursor-not-allowed"; 
                    }

                    return (
                        <button 
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult}
                            className={`p-6 rounded-2xl font-black text-lg transition-all active:scale-95 text-left flex items-center justify-between shadow-sm ${buttonStyle}`}
                        >
                            <span className="uppercase flex items-center gap-3 w-full">
                                <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm shrink-0">{option.toUpperCase()}</span>
                                {/* ✅ RENDER MATH OPTIONS */}
                                <span className="flex-1"><Latex>{currentQ[option]}</Latex></span>
                            </span>
                            {showResult && isCorrect && <CheckCircle size={24} className="animate-in zoom-in spin-in-180 shrink-0"/>}
                            {showResult && isSelected && !isCorrect && <XCircle size={24} className="animate-in zoom-in shrink-0"/>}
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
}
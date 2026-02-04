'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import useGameSounds from '../../lib/useGameSounds'; 
import { Clock, AlertTriangle, CheckCircle, XCircle, Flame, Loader2 } from 'lucide-react';

function formatMath(text: string) {
  if (!text) return "";
  return text
    .replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/\^o/g, "°")
    .replace(/sqrt/gi, "√").replace(/pi/gi, "π").replace(/\*/g, "×");
}

export default function DailyChallenge() {
  const router = useRouter();
  const { playCorrect, playWrong } = useGameSounds(); 

  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => { fetchDailyQuestions(); }, []);

  async function fetchDailyQuestions() {
    const { data } = await supabase.from('questions').select('*').eq('is_daily', true);
    if (data && data.length > 0) {
      const shuffled = data.sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 3));
    } else { setQuestions([]); }
    setLoading(false);
  }

  const handleAnswer = async (choice: string) => {
    if (showResult) return; 
    setSelected(choice);
    setShowResult(true);
    const currentQ = questions[currentQIndex];

    if (choice === currentQ.answer) {
      playCorrect(); 
      setScore(prev => prev + 1);
      setTimeout(() => { nextQuestion(score + 1); }, 1000);
    } else {
      playWrong(); 
      setTimeout(() => { finishChallenge(score, false); }, 1000);
    }
  };

  const nextQuestion = (currentScore: number) => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      finishChallenge(currentScore, true); 
    }
  };

  const finishChallenge = async (finalScore: number, isWin: boolean) => {
    setIsFinished(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0]; 
      const key = `daily_challenge_${today}_${user.id}`; 
      if (isWin && finalScore === questions.length) {
        localStorage.setItem(key, 'completed'); 
        const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
        if (profile) await supabase.from('profiles').update({ xp: profile.xp + 50 }).eq('id', user.id);
      } else {
        localStorage.setItem(key, 'failed'); 
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-white" size={40} /></div>;

  if (questions.length === 0) return (
    <div className="min-h-screen bg-indigo-900 flex items-center justify-center text-white text-center p-6">
      <div><h1 className="text-2xl font-bold mb-2">No Challenges Yet!</h1><p className="text-indigo-300 mb-6">The teacher hasn't posted today's questions.</p><Link href="/dashboard"><button className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold">Back Home</button></Link></div>
    </div>
  );

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          {score === questions.length ? (
            <div><CheckCircle size={64} className="text-green-500 mx-auto mb-4" /><h1 className="text-3xl font-black text-gray-900 mb-2">Challenge Crushed!</h1><p className="text-gray-500 mb-6">You earned <span className="text-yellow-500 font-bold">+50 XP</span>.</p><Link href="/dashboard"><button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">Claim & Return</button></Link></div>
          ) : (
            <div><XCircle size={64} className="text-red-500 mx-auto mb-4" /><h1 className="text-3xl font-black text-gray-900 mb-2">Challenge Failed</h1><p className="text-gray-500 mb-6">You missed a question.</p><Link href="/dashboard"><button className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition">Return to Dashboard</button></Link></div>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  
  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center text-indigo-100 mb-6 font-bold text-sm">
           <span className="flex items-center gap-2"><Clock size={16}/> Daily Goal</span>
           <span className="bg-indigo-500/50 px-3 py-1 rounded-full border border-indigo-400/30">{currentQIndex + 1} / {questions.length}</span>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gray-100"><div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}></div></div>
           <h2 className="text-xl font-bold text-gray-800 mt-4 mb-8 leading-snug">{formatMath(currentQ.question)}</h2>
           <div className="space-y-3">
             {['a', 'b', 'c'].map((opt) => (
               <button key={opt} onClick={() => handleAnswer(opt)} disabled={showResult} className={`w-full text-left p-4 rounded-xl border-2 font-bold transition-all duration-200 flex items-center gap-3 ${showResult ? (opt === currentQ.answer ? "bg-green-100 border-green-500 text-green-700" : (opt === selected ? "bg-red-100 border-red-500 text-red-700" : "opacity-50")) : "bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"}`}>
                 <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] uppercase text-gray-400">{opt}</span>
                 {formatMath(currentQ[opt])}
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
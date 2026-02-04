'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import useGameSounds from '../../lib/useGameSounds';
import { ArrowLeft, Loader2, Trophy, RotateCcw } from 'lucide-react';

export default function ComputingQuiz() {
  const { playCorrect, playWrong } = useGameSounds();
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [question, setQuestion] = useState<any>(null);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', 'computing')
        .eq('is_daily', false); 

      if (data && data.length > 0) {
        setAllQuestions(data);
        pickNewQuestion(data, []);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, []);

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
      // ✅ CORRECT
      playCorrect(); 
      setCorrectCount(c => c + 1);
      
      // 1. Get Real User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Fetch their current stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, coins')
          .eq('id', user.id) // <--- TARGET REAL USER ID
          .single();
          
        if (profile) {
          // 3. Update their stats
          await supabase
            .from('profiles')
            .update({ 
              xp: profile.xp + 10, 
              coins: profile.coins + 5 
            })
            .eq('id', user.id);
        }
      }

    } else {
      // ❌ WRONG
      playWrong(); 
      setWrongCount(w => w + 1);
    }

    // Auto-Advance
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  if (isFinished) return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border-4 border-purple-100">
        <Trophy size={80} className="text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-800 mb-2">Computing Quiz Complete!</h1>
        <div className="grid grid-cols-2 gap-4 mb-8 mt-6">
          <div className="bg-blue-50 p-4 rounded-xl"><div className="text-3xl font-black text-blue-600">{correctCount + wrongCount}</div><div className="text-xs font-bold text-gray-400 uppercase">Answered</div></div>
          <div className="bg-purple-50 p-4 rounded-xl"><div className="text-3xl font-black text-purple-600">{Math.round((correctCount / (correctCount + wrongCount || 1)) * 100)}%</div><div className="text-xs font-bold text-gray-400 uppercase">Accuracy</div></div>
          <div className="bg-green-50 p-4 rounded-xl"><div className="text-3xl font-black text-green-600">{correctCount}</div><div className="text-xs font-bold text-gray-400 uppercase">Correct</div></div>
          <div className="bg-red-50 p-4 rounded-xl"><div className="text-3xl font-black text-red-600">{wrongCount}</div><div className="text-xs font-bold text-gray-400 uppercase">Wrong</div></div>
        </div>
        <button onClick={() => router.back()} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center justify-center gap-2"><RotateCcw size={20}/> Return to Dashboard</button>
      </div>
    </div>
  );

  if (!question) return <div className="p-10 text-center">No Questions Found.</div>;

  const progressPercentage = (seenIds.length / allQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-purple-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition font-bold"><ArrowLeft size={20} /> Exit Computing</button>
        <span className="font-bold text-purple-200 text-5xl opacity-20 uppercase tracking-widest select-none">COMPUTING</span>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-purple-100 relative min-h-[400px] flex flex-col justify-center overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full">
           <div className="w-full h-3 bg-gray-100">
             <div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
           </div>
           <div className="px-8 pt-4 flex justify-between items-center text-gray-400 font-bold text-xs uppercase tracking-wider">
              <span>Question {seenIds.length} of {allQuestions.length}</span>
              <span>XP Boost Active</span>
           </div>
        </div>

        <div className="p-8 md:p-12 mt-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 leading-tight">{question.question}</h2>
          <div className="space-y-4">
            {['a', 'b', 'c'].map((opt) => (
              <button key={opt} disabled={showResult} onClick={() => handleAnswer(opt)} className={`w-full text-left p-4 rounded-xl font-bold text-lg transition-all border-2 flex items-center gap-4 ${showResult && opt === question.answer ? 'border-green-500 bg-green-50 text-green-700' : selected === opt ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 bg-white hover:bg-purple-50'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 ${showResult && opt === question.answer ? 'border-green-500 bg-green-100' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>{opt.toUpperCase()}</div>
                <span>{question[opt]}</span>
              </button>
            ))}
          </div>
        </div>
        
        {showResult && <div className={`p-4 text-center text-white font-bold text-lg rounded-b-2xl ${selected === question.answer ? 'bg-green-500' : 'bg-red-500'}`}>{selected === question.answer ? "✅ Correct! +10 XP" : `❌ Answer: ${question.answer.toUpperCase()}`}</div>}
      </div>
    </div>
  );
}
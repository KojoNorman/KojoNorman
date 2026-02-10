'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Monitor, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// --- 1. IMPORT PROFESSIONAL MATH ENGINE (For Logic Gates/Binary) ---
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function ComputingPage() {
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Get User's Grade
    const { data: profile } = await supabase.from('profiles').select('grade_level').eq('id', user.id).single();
    
    if (profile) {
      setGrade(profile.grade_level);

      // 3. Fetch Computing Questions for this Grade
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', 'computing') // <--- FILTER FOR COMPUTING
        .eq('grade_level', profile.grade_level)
        .eq('is_daily', false);

      if (qData) setQuestions(qData);
    }
    setLoading(false);
  };

  const handleAnswer = (choice: string) => {
    if (showResult) return;
    
    setSelected(choice);
    setShowResult(true);
    
    if (choice === questions[currentQ].answer) {
      setScore(score + 1);
    }
    
    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setShowResult(false);
        setSelected("");
      } else {
        alert(`Computing Session Complete! Score: ${score + (choice === questions[currentQ].answer ? 1 : 0)}/${questions.length}`);
      }
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-purple-50"><Loader2 className="animate-spin text-purple-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-purple-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-purple-600 transition">
            <ArrowLeft size={24}/>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-purple-900 tracking-tight flex items-center gap-2">
              <Monitor className="text-purple-500" size={28} /> Computing
            </h1>
            <p className="text-purple-600 font-bold text-sm uppercase tracking-widest">{grade} Workbook</p>
          </div>
        </div>

        {questions.length > 0 ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border-b-4 border-purple-100 relative overflow-hidden">
             
             {/* Progress Bar */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
               <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
             </div>

             <div className="mb-8 mt-4">
               <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
               
               {/* LATEX WRAPPER FOR LOGIC/BINARY */}
               <h2 className="text-2xl md:text-3xl font-bold mt-4 text-gray-800 leading-snug">
                 <Latex>{questions[currentQ].question}</Latex>
               </h2>
             </div>
             
             <div className="space-y-3">
               {['a','b','c'].map((opt) => (
                 <button 
                   key={opt}
                   onClick={() => handleAnswer(opt)}
                   disabled={showResult}
                   className={`w-full text-left p-5 rounded-xl border-2 font-bold transition-all flex items-center gap-4 group
                     ${showResult 
                       ? (opt === questions[currentQ].answer 
                           ? "bg-purple-50 border-purple-500 text-purple-800 ring-1 ring-purple-500" 
                           : (selected === opt ? "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500" : "opacity-50")) 
                       : "bg-white border-gray-100 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md"
                     }`}
                 > 
                   <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border-2 transition-colors
                      ${showResult && opt === questions[currentQ].answer ? "bg-purple-500 text-white border-purple-500" : "bg-white border-gray-200 text-gray-400 group-hover:border-purple-300 group-hover:text-purple-600"}
                   `}>
                     {opt}
                   </span>
                   
                   <span className="text-lg text-gray-700">
                     <Latex>{questions[currentQ][opt]}</Latex>
                   </span>
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
            <Monitor className="mx-auto text-purple-200 mb-4" size={48} />
            <p className="text-gray-400 font-medium">No computing questions for <span className="text-purple-600 font-bold">{grade}</span> yet.</p>
            <p className="text-sm text-gray-400 mt-2">Ask your teacher to add some!</p>
          </div>
        )}
      </div>
    </div>
  );
}
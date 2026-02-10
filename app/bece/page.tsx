'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { 
  Clock, CheckCircle, ChevronRight, ChevronLeft, 
  RotateCcw, Save, LayoutGrid, GraduationCap, ArrowLeft, Loader2, Edit3, Eye
} from 'lucide-react';

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// ✅ Import the XP Helper
import { getXpForGrade } from '../../lib/xpHelper';

export default function BeceExamPage() {
  const router = useRouter();
  
  // --- STATES ---
  const [status, setStatus] = useState<'lobby' | 'active' | 'finished'>('lobby');
  const [subject, setSubject] = useState<string>('math');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({}); 
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20 * 60); 
  const timerRef = useRef<any>(null);

  // --- 1. START EXAM ---
  async function startExam(selectedSubject: string) {
    setSubject(selectedSubject);
    setLoading(true);
    
    // Fetch Questions
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', selectedSubject)
      .in('grade_level', ['JHS 1', 'JHS 2', 'JHS 3']); 

    if (data && data.length > 0) {
      // Shuffle and pick 20 (Mix of Objective & Theory)
      const examSet = data.sort(() => 0.5 - Math.random()).slice(0, 20);
      setQuestions(examSet);
      setAnswers({});
      setCurrentQ(0);
      setTimeLeft(selectedSubject === 'math' ? 30 * 60 : 20 * 60); // Math gets more time
      setStatus('active');
      startTimer();
    } else {
      alert(`No JHS questions found for ${selectedSubject}.`);
    }
    setLoading(false);
  }

  // --- 2. TIMER ---
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { submitExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // --- 3. SUBMIT & SAVE (UPDATED WITH WEIGHTED XP) ---
  const submitExam = async () => {
    clearInterval(timerRef.current);
    
    // 1. Calculate Score (Objective Only)
    const objectiveQuestions = questions.filter(q => q.a && q.b);
    const calculatedScore = objectiveQuestions.reduce((acc, q) => {
        const idx = questions.findIndex(item => item.id === q.id);
        return acc + (answers[idx] === q.answer ? 1 : 0);
    }, 0);

    // 2. SAVE TO DATABASE
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Insert into exam_results table
        await supabase.from('exam_results').insert({
            user_id: user.id,
            subject: subject,
            score: calculatedScore,
            total: objectiveQuestions.length
        });

        // --- 🆕 WEIGHTED XP CALCULATION ---
        let totalXpEarned = 0;
        
        // Loop through all questions to check correctness
        questions.forEach((q, idx) => {
            // Check if the user answered this specific question correctly
            if (answers[idx] === q.answer) {
                // Award XP based on the DIFFICULTY (grade level) of the question
                // Example: Class 1 = 5 XP, JHS 3 = 30 XP
                totalXpEarned += getXpForGrade(q.grade_level);
            }
        });

        // Award the calculated weighted amount
        if (totalXpEarned > 0) {
            await supabase.rpc('increment_xp', { x: totalXpEarned, row_id: user.id });
        }
    }

    setStatus('finished');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 4. SCORING VARIABLES FOR UI ---
  const objectiveQuestions = questions.filter(q => q.a && q.b);
  const theoryQuestions = questions.filter(q => !q.a || !q.b);

  const objScore = objectiveQuestions.reduce((acc, q) => {
    const idx = questions.findIndex(item => item.id === q.id);
    return acc + (answers[idx] === q.answer ? 1 : 0);
  }, 0);
  
  const percentage = Math.round((objScore / (objectiveQuestions.length || 1)) * 100);
  const stanine = percentage >= 80 ? 1 : percentage >= 70 ? 2 : percentage >= 60 ? 3 : percentage >= 50 ? 4 : 9;

  // --- RENDER: LOBBY ---
  if (status === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-2xl w-full relative z-10">
          <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition font-bold"><ArrowLeft size={20} className="mr-2"/> Exit Exam Mode</Link>
          
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
               <GraduationCap size={48} className="text-white"/>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">BECE Simulator</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">Supports both Objective (Multi-choice) and Subjective (Theory) questions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['math', 'science', 'computing'].map((subj) => (
              <button 
                key={subj}
                onClick={() => startExam(subj)}
                disabled={loading}
                className="group relative overflow-hidden bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 p-6 rounded-2xl transition-all duration-300 text-left"
              >
                <h3 className="text-xl font-black capitalize mb-1 group-hover:text-white">{subj}</h3>
                <p className="text-xs font-bold text-slate-500 group-hover:text-indigo-200 uppercase tracking-widest">Start Mock</p>
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                   {loading ? <Loader2 className="animate-spin"/> : <ChevronRight/>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULTS ---
  if (status === 'finished') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
           <h2 className="text-3xl font-black text-slate-900 mb-8">Exam Results</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Objective Score */}
              <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 text-center">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Objective Score</h3>
                 <span className="text-6xl font-black text-slate-900">{objScore}</span>
                 <span className="text-xl text-slate-400 font-bold">/{objectiveQuestions.length}</span>
                 <div className="mt-4 inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                    Stanine: {stanine}
                 </div>
              </div>
              
              {/* Theory Status */}
              <div className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-lg text-center flex flex-col justify-center">
                 <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Theory Section</h3>
                 <span className="text-4xl font-black">{theoryQuestions.length} Questions</span>
                 <p className="text-indigo-200 text-sm mt-2">Theory answers are not auto-graded. Review the model answers below.</p>
              </div>
           </div>

           {/* Review Section */}
           <div className="space-y-6">
              <h3 className="font-black text-slate-900 text-xl">Review & Corrections</h3>
              {questions.map((q, idx) => {
                 const isObjective = q.a && q.b;
                 const userAnswer = answers[idx];
                 const isCorrect = userAnswer === q.answer;

                 return (
                    <div key={idx} className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm ${isObjective ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-indigo-500'}`}>
                       <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">Question {idx + 1} ({isObjective ? 'Obj' : 'Theory'})</span>
                          {isObjective && (isCorrect ? <CheckCircle size={18} className="text-green-500"/> : <span className="text-red-500 font-bold text-xs">Wrong</span>)}
                       </div>
                       <div className="font-bold text-slate-800 mb-4 text-lg"><Latex>{q.question}</Latex></div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-50 p-3 rounded-lg">
                             <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Your Answer</span>
                             <p className="font-medium text-slate-700">{userAnswer || <span className="text-red-400 italic">No Answer</span>}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                             <span className="block text-xs font-bold text-green-600 uppercase mb-1">Correct Answer</span>
                             <div className="font-bold text-green-800"><Latex>{q.answer}</Latex></div>
                          </div>
                       </div>
                    </div>
                 )
              })}
           </div>

           <div className="mt-12 text-center pb-12">
              <button onClick={() => setStatus('lobby')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center justify-center gap-2 mx-auto">
                 <RotateCcw size={18}/> Finish Review
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE EXAM ---
  const currentQuestion = questions[currentQ];
  const isObjective = currentQuestion?.a && currentQuestion?.b; // Check if options exist

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* 1. TOP BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="font-black text-xl text-slate-900 uppercase">{subject}</span>
              <span className="hidden md:inline-block w-px h-6 bg-slate-200"></span>
              <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                 <Clock size={20}/> {formatTime(timeLeft)}
              </div>
           </div>
           <button onClick={submitExam} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2">
              <Save size={16}/> Submit
           </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
         
         {/* 2. QUESTION AREA */}
         <div className="lg:col-span-3">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200 min-h-[450px] flex flex-col border border-slate-100">
               
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isObjective ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {isObjective ? 'Objective' : 'Theory'}
                     </span>
                  </div>
                  
                  <div className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
                     <Latex>{currentQuestion.question}</Latex>
                  </div>

                  {/* --- DYNAMIC RENDER: OBJECTIVE VS THEORY --- */}
                  {isObjective ? (
                     <div className="space-y-3">
                        {['a', 'b', 'c', 'd'].map((opt) => (
                           <button
                              key={opt}
                              onClick={() => setAnswers({...answers, [currentQ]: opt})}
                              className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center gap-4 group
                                 ${answers[currentQ] === opt 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' 
                                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                                 }`}
                           >
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase transition-colors
                                 ${answers[currentQ] === opt ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-indigo-200'}`}>
                                 {opt}
                              </span>
                              <span className="text-lg"><Latex>{currentQuestion[opt]}</Latex></span>
                           </button>
                        ))}
                     </div>
                  ) : (
                     // THEORY INPUT
                     <div className="relative">
                        <textarea
                           value={answers[currentQ] || ''}
                           onChange={(e) => setAnswers({...answers, [currentQ]: e.target.value})}
                           placeholder="Type your answer here..."
                           className="w-full h-48 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium resize-none"
                        />
                        <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-400 pointer-events-none">
                           <Edit3 size={14} className="inline mr-1"/> Subjective Answer
                        </div>
                     </div>
                  )}
               </div>

               {/* Nav Buttons */}
               <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                  <button 
                     disabled={currentQ === 0}
                     onClick={() => setCurrentQ(prev => prev - 1)}
                     className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 disabled:opacity-30 transition"
                  >
                     <ChevronLeft size={20}/> Previous
                  </button>
                  <button 
                     disabled={currentQ === questions.length - 1}
                     onClick={() => setCurrentQ(prev => prev + 1)}
                     className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition flex items-center gap-2 disabled:opacity-50"
                  >
                     Next <ChevronRight size={20}/>
                  </button>
               </div>

            </div>
         </div>

         {/* 3. QUESTION PALETTE */}
         <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
               <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4 flex items-center gap-2"><LayoutGrid size={16}/> Question Map</h3>
               <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => (
                     <button
                        key={idx}
                        onClick={() => setCurrentQ(idx)}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all relative
                           ${currentQ === idx 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-110 ring-2 ring-offset-2 ring-indigo-600' 
                              : answers[idx] 
                                 ? 'bg-indigo-100 text-indigo-700' 
                                 : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                           }`}
                     >
                        {idx + 1}
                        {/* Dot to indicate Theory Question */}
                        {(!q.a || !q.b) && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>}
                     </button>
                  ))}
               </div>
               
               <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Current
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <span className="w-3 h-3 rounded-full bg-indigo-100"></span> Answered
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <span className="w-3 h-3 rounded-full bg-purple-500"></span> Theory Q
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
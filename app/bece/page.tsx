'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Lock, GraduationCap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// --- THE MATH FORMATTER ---
function formatMath(text: string) {
  if (!text) return "";
  return text
    .replace(/\^0/g, "⁰").replace(/\^1/g, "¹").replace(/\^2/g, "²")
    .replace(/\^3/g, "³").replace(/\^4/g, "⁴").replace(/\^5/g, "⁵")
    .replace(/\^6/g, "⁶").replace(/\^7/g, "⁷").replace(/\^8/g, "⁸").replace(/\^9/g, "⁹")
    .replace(/\^x/g, "ˣ").replace(/\^y/g, "ʸ").replace(/\^n/g, "ⁿ")
    .replace(/\^-1/g, "⁻¹").replace(/\^-2/g, "⁻²")
    .replace(/sqrt/gi, "√").replace(/pi/gi, "π").replace(/theta/gi, "θ")
    .replace(/degree[s]?/gi, "°").replace(/\^o/gi, "°")
    .replace(/\*/g, "×").replace(/times/gi, "×")
    .replace(/<=/g, "≤").replace(/>=/g, "≥")
    .replace(/!=/g, "≠").replace(/approx/gi, "≈")
    .replace(/1\/2/g, "½").replace(/1\/4/g, "¼").replace(/3\/4/g, "¾");
}

export default function BecePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [year, setYear] = useState("2023");
  const [subject, setSubject] = useState("math");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("menu"); 
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => { checkAccess(); }, []);

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('grade_level').eq('id', user.id).single();
    if (profile) {
      if (profile.grade_level === 'JHS 3') setIsAuthorized(true);
      else setIsAuthorized(false);
    }
    setLoading(false);
  }

  async function startExam() {
    setLoading(true);
    const { data } = await supabase.from('bece_questions').select('*').eq('year', year).eq('subject', subject);
    if (data && data.length > 0) {
      setQuestions(data);
      setGameStatus("playing");
      setCurrentQ(0);
      setScore(0);
    } else {
      alert("No questions found for this Year/Subject.");
    }
    setLoading(false);
  }

  const handleAnswer = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    setShowResult(true);
    if (choice === questions[currentQ].answer) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(curr => curr + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setGameStatus("finished");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Checking Eligibility...</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <Lock size={80} className="text-gray-600 mb-6" />
        <h1 className="text-3xl font-black mb-4">Restricted Access</h1>
        <p className="text-gray-400 max-w-md mb-8">The BECE Prep Zone is exclusively for <strong>Final Year Candidates (JHS 3)</strong>.</p>
        <Link href="/dashboard" className="text-gray-500 hover:text-white font-bold flex items-center gap-2"><ArrowLeft size={20}/> Return to Dashboard</Link>
      </div>
    );
  }

  if (gameStatus === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-8"><ArrowLeft size={20}/> Exit Exam Mode</Link>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-4 border-slate-100 text-center">
            <div className="inline-block p-4 bg-slate-900 text-white rounded-full mb-6"><GraduationCap size={48} /></div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">BECE Simulator</h1>
            <p className="text-slate-500 font-medium mb-8">Select a Past Question Paper to begin.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-lg mx-auto mb-8">
              <select value={year} onChange={(e) => setYear(e.target.value)} className="p-4 bg-slate-50 rounded-xl font-bold border-2 border-slate-200"><option value="2023">Year 2023</option><option value="2022">Year 2022</option></select>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="p-4 bg-slate-50 rounded-xl font-bold border-2 border-slate-200"><option value="math">Mathematics</option><option value="science">Integrated Science</option><option value="computing">Computing</option></select>
            </div>
            <button onClick={startExam} className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg shadow-slate-300">Open Exam Paper</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === 'playing') {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-slate-100 p-6 font-sans flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
             <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">BECE {year} • {subject.toUpperCase()}</span>
             <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-sm font-bold text-slate-600"><Clock size={14}/> Exam Mode</div>
          </div>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg relative min-h-[400px]">
            <div className="absolute top-6 right-8 text-slate-200 font-black text-6xl opacity-20">{currentQ + 1}</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-8 pr-10">{formatMath(q.question)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['a','b','c','d'].map((opt) => (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={showResult} className={`p-4 rounded-xl font-bold text-left border-2 transition-all ${showResult && opt === q.answer ? 'bg-green-100 border-green-500 text-green-800' : showResult && opt === selected && opt !== q.answer ? 'bg-red-100 border-red-500 text-red-800' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                  <span className="uppercase mr-2 opacity-50">{opt}.</span> {formatMath(q[opt])}
                </button>
              ))}
            </div>
            {showResult && (
              <div className="mt-8 flex justify-end">
                <button onClick={nextQuestion} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition">{currentQ < questions.length - 1 ? "Next Question" : "Finish Exam"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full">
        <div className="inline-block p-4 bg-green-100 text-green-600 rounded-full mb-6"><CheckCircle size={48} /></div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Paper Completed!</h1>
        <p className="text-slate-500 mb-6">You scored <span className="text-slate-900 font-black">{score} / {questions.length}</span></p>
        <button onClick={() => setGameStatus('menu')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition">Take Another Paper</button>
      </div>
    </div>
  );
}
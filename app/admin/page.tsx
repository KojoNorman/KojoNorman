'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, PlusCircle, CheckCircle, 
  BookOpen, Video, Brain, PenTool, LayoutDashboard, 
  GraduationCap, Users, ShieldAlert, Loader2
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [activeTab, setActiveTab] = useState('quiz'); 
  const [message, setMessage] = useState("");
  
  // Super Admin Data
  const [userList, setUserList] = useState<any[]>([]);

  // --- FORM STATES (Existing) ---
  const [qSubject, setQSubject] = useState("math");
  const [qQuestion, setQQuestion] = useState("");
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");
  const [qAns, setQAns] = useState("a");
  const [isDaily, setIsDaily] = useState(false);

  const [lSubject, setLSubject] = useState("science");
  const [lGrade, setLGrade] = useState("Class 1");
  const [lTitle, setLTitle] = useState("");
  const [lContent, setLContent] = useState("");
  const [lImage, setLImage] = useState("");

  const [vTitle, setVTitle] = useState("");
  const [vCategory, setVCategory] = useState("science");
  const [vGrade, setVGrade] = useState("all");
  const [vId, setVId] = useState("");

  const [sTitle, setSTitle] = useState("");
  const [sAuthor, setSAuthor] = useState("");
  const [sGrade, setSGrade] = useState("Class 1");
  const [sContent, setSContent] = useState("");
  const [sCover, setSCover] = useState("");

  const [bYear, setBYear] = useState("2023");
  const [bSubject, setBSubject] = useState("math");
  const [bQuestion, setBQuestion] = useState("");
  const [bA, setBA] = useState("");
  const [bB, setBB] = useState("");
  const [bC, setBC] = useState("");
  const [bD, setBD] = useState("");
  const [bAns, setBAns] = useState("a");

  // --- 1. SECURITY CHECK (The Bouncer) ---
  useEffect(() => {
    const checkPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check Role in Database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'super_admin') {
        // If not a Super Admin, Kick them out!
        alert("⛔ ACCESS DENIED: Developer Access Only.");
        router.push('/dashboard');
      } else {
        // Let them in
        setVerifying(false);
        setLoading(false);
      }
    };

    checkPermission();
  }, [router]);

  // --- 2. FETCH USERS (For User Tab) ---
  const fetchUsers = async () => {
    setLoading(true);
    // Note: This fetches profiles. In a real app, you might need special policies to see this.
    const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false });
    if (data) setUserList(data);
    setLoading(false);
  };

  // --- 3. SUBMIT HANDLERS ---
  const submitQuiz = async () => {
    setLoading(true);
    const { error } = await supabase.from('questions').insert({
      subject: qSubject, question: qQuestion, a: qA, b: qB, c: qC, answer: qAns, is_daily: isDaily 
    });
    handleResult(error, "Quiz Question Added!");
  };

  const submitLesson = async () => {
    setLoading(true);
    const { error } = await supabase.from('lessons').insert({
      subject: lSubject, grade_level: lGrade, title: lTitle, content: lContent, image_url: lImage
    });
    handleResult(error, "Lesson Published!");
  };

  const submitVideo = async () => {
    setLoading(true);
    const { error } = await supabase.from('videos').insert({
      title: vTitle, category: vCategory, grade_level: vGrade, video_id: vId
    });
    handleResult(error, "Video Added!");
  };

  const submitStory = async () => {
    setLoading(true);
    const { error } = await supabase.from('stories').insert({
      title: sTitle, author: sAuthor, grade_level: sGrade, content: sContent, cover_url: sCover
    });
    handleResult(error, "Story Added!");
  };

  const submitBECE = async () => {
    setLoading(true);
    const { error } = await supabase.from('bece_questions').insert({
      year: bYear, subject: bSubject, question: bQuestion, a: bA, b: bB, c: bC, d: bD, answer: bAns
    });
    handleResult(error, "BECE Question Added!");
  };

  const handleResult = (error: any, successMsg: string) => {
    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setMessage(successMsg);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <ShieldAlert size={60} className="text-red-500 mb-4 animate-pulse" />
        <h1 className="text-xl font-bold">Verifying Developer Clearance...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} /> Exit Admin
        </Link>
        <div className="flex items-center gap-3">
           <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <ShieldAlert size={14}/> Super Admin Mode
           </span>
           <h1 className="text-2xl font-black text-white flex items-center gap-2">
             Teacher's Desk
           </h1>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2">
        <TabButton id="quiz" icon={<Brain size={18}/>} label="Add Quiz" active={activeTab} set={setActiveTab} />
        <TabButton id="lesson" icon={<BookOpen size={18}/>} label="Add Textbook" active={activeTab} set={setActiveTab} />
        <TabButton id="video" icon={<Video size={18}/>} label="Add Video" active={activeTab} set={setActiveTab} />
        <TabButton id="story" icon={<PenTool size={18}/>} label="Add Story" active={activeTab} set={setActiveTab} />
        <TabButton id="bece" icon={<GraduationCap size={18}/>} label="Add BECE" active={activeTab} set={setActiveTab} />
        
        {/* 🔥 NEW SUPER ADMIN TAB */}
        <button onClick={() => { setActiveTab('users'); fetchUsers(); }} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ml-auto ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-400'}`}>
          <Users size={18}/> Manage Users
        </button>
      </div>

      {/* MAIN FORM AREA */}
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        
        {message && (
          <div className="bg-green-500/20 text-green-300 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold animate-pulse">
            <CheckCircle size={20}/> {message}
          </div>
        )}

        {/* 1. QUIZ FORM */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-300 mb-4">Create General Quiz Question</h2>
            <div className="flex gap-4">
              <select className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qSubject} onChange={e => setQSubject(e.target.value)}>
                <option value="math">Mathematics</option><option value="science">Science</option><option value="computing">Computing</option>
              </select>
            </div>
            <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={3} value={qQuestion} onChange={e => setQQuestion(e.target.value)} placeholder="Question..." />
            <div className="grid grid-cols-3 gap-2">
              <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option A" value={qA} onChange={e => setQA(e.target.value)} />
              <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option B" value={qB} onChange={e => setQB(e.target.value)} />
              <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option C" value={qC} onChange={e => setQC(e.target.value)} />
            </div>
            <div className="flex gap-4">
               <select className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qAns} onChange={e => setQAns(e.target.value)}>
                  <option value="a">Answer: A</option><option value="b">Answer: B</option><option value="c">Answer: C</option>
               </select>
               <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl flex-1">
                 <input type="checkbox" className="w-5 h-5 accent-indigo-500" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)}/>
                 <span className="text-sm font-bold text-white">Daily Challenge?</span>
               </div>
            </div>
            <SubmitBtn loading={loading} onClick={submitQuiz} label="Add Question" />
          </div>
        )}

        {/* 2. LESSON FORM */}
        {activeTab === 'lesson' && (
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-blue-300 mb-4">Publish Textbook Lesson</h2>
             <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lSubject} onChange={e => setLSubject(e.target.value)}>
                  <option value="math">Math</option><option value="science">Science</option><option value="computing">Computing</option>
                </select>
                <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lGrade} onChange={e => setLGrade(e.target.value)}>
                  <option>Class 1</option><option>Class 2</option><option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option><option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
                </select>
             </div>
             <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={lTitle} onChange={e => setLTitle(e.target.value)} />
             <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={5} placeholder="Content..." value={lContent} onChange={e => setLContent(e.target.value)} />
             <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Image URL" value={lImage} onChange={e => setLImage(e.target.value)} />
             <SubmitBtn loading={loading} onClick={submitLesson} label="Publish Lesson" />
          </div>
        )}

        {/* 3. VIDEO FORM */}
        {activeTab === 'video' && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-red-300 mb-4">Add Lab Video</h2>
             <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Video Title" value={vTitle} onChange={e => setVTitle(e.target.value)} />
             <div className="grid grid-cols-2 gap-4">
               <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vCategory} onChange={e => setVCategory(e.target.value)}>
                  <option value="science">Science</option><option value="crafts">Crafts</option><option value="computing">Computing</option>
               </select>
               <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vGrade} onChange={e => setVGrade(e.target.value)}>
                  <option value="all">All Ages</option><option>Class 1</option><option>JHS 1</option>
               </select>
             </div>
             <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="YouTube ID" value={vId} onChange={e => setVId(e.target.value)} />
             <SubmitBtn loading={loading} onClick={submitVideo} label="Add Video" />
           </div>
        )}

        {/* 4. STORY FORM */}
        {activeTab === 'story' && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-orange-300 mb-4">Add Storybook</h2>
             <div className="grid grid-cols-2 gap-4">
               <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={sTitle} onChange={e => setSTitle(e.target.value)} />
               <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Author" value={sAuthor} onChange={e => setSAuthor(e.target.value)} />
             </div>
             <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={sGrade} onChange={e => setSGrade(e.target.value)}>
                <option value="all">All Ages</option><option>Class 1</option><option>Class 2</option><option>Class 3</option><option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
             </select>
             <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={6} placeholder="Story Content..." value={sContent} onChange={e => setSContent(e.target.value)} />
             <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Cover URL" value={sCover} onChange={e => setSCover(e.target.value)} />
             <SubmitBtn loading={loading} onClick={submitStory} label="Publish Story" />
           </div>
        )}

        {/* 5. BECE FORM */}
        {activeTab === 'bece' && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-yellow-300 mb-4">Add BECE Past Question (JHS 3)</h2>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase">Exam Year</label>
                   <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl mt-1" value={bYear} onChange={e => setBYear(e.target.value)}>
                     <option>2024</option><option>2023</option><option>2022</option><option>2021</option><option>2020</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                   <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl mt-1" value={bSubject} onChange={e => setBSubject(e.target.value)}>
                     <option value="math">Mathematics</option><option value="science">Integrated Science</option><option value="computing">Computing</option>
                   </select>
                </div>
             </div>
             <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={3} placeholder="Question..." value={bQuestion} onChange={e => setBQuestion(e.target.value)} />
             <div className="grid grid-cols-2 gap-2">
               <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option A" value={bA} onChange={e => setBA(e.target.value)} />
               <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option B" value={bB} onChange={e => setBB(e.target.value)} />
               <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option C" value={bC} onChange={e => setBC(e.target.value)} />
               <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option D" value={bD} onChange={e => setBD(e.target.value)} />
             </div>
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase">Correct Answer</label>
               <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl mt-1" value={bAns} onChange={e => setBAns(e.target.value)}>
                 <option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option>
               </select>
             </div>
             <SubmitBtn loading={loading} onClick={submitBECE} label="Add BECE Question" />
           </div>
        )}

        {/* 6. MANAGE USERS (SUPER ADMIN) */}
        {activeTab === 'users' && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2"><Users size={24}/> Registered Users</h2>
             <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
               <table className="w-full text-left">
                 <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-bold">
                   <tr>
                     <th className="p-4">User</th>
                     <th className="p-4">Class</th>
                     <th className="p-4">XP</th>
                     <th className="p-4">Coins</th>
                     <th className="p-4">Role</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800">
                   {userList.map((user) => (
                     <tr key={user.id} className="hover:bg-slate-800/50">
                       <td className="p-4">
                         <div className="font-bold text-white">{user.full_name || "Unknown"}</div>
                       </td>
                       <td className="p-4 text-slate-300 text-sm">{user.grade_level || "None"}</td>
                       <td className="p-4 text-green-400 font-bold">{user.xp} XP</td>
                       <td className="p-4 text-yellow-400 font-bold">${user.coins}</td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'super_admin' ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-slate-300'}`}>
                           {user.role || 'student'}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {userList.length === 0 && <div className="p-8 text-center text-slate-500">Loading users...</div>}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}

// Helper Components
function TabButton({id, icon, label, active, set}: any) {
  const isActive = active === id;
  return (
    <button onClick={() => set(id)} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
      {icon} {label}
    </button>
  );
}

function SubmitBtn({loading, onClick, label}: any) {
  return (
    <button disabled={loading} onClick={onClick} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20 mt-4 flex justify-center items-center gap-2">
      {loading ? "Processing..." : <><PlusCircle size={20}/> {label}</>}
    </button>
  );
}
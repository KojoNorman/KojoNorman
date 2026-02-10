'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, PlusCircle, CheckCircle, Trash2,
  BookOpen, Video, Brain, PenTool, 
  GraduationCap, ShieldAlert, FileText, List, Image as ImageIcon, Bold, Type, Lock, Users, Search, Save, Loader2
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [mode, setMode] = useState<'add' | 'manage'>('add'); 
  const [activeTab, setActiveTab] = useState('quiz');
  const [message, setMessage] = useState("");
  
  const [contentList, setContentList] = useState<any[]>([]);
  const [fetchingList, setFetchingList] = useState(false);

  // --- NEW: USER MANAGEMENT STATE ---
  const [userSearch, setUserSearch] = useState("");
  const [userList, setUserList] = useState<any[]>([]);

  // --- MASTER LISTS ---
  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const subjects = [
    "Mathematics", "English Language", "Science", "Computing",
    "Social Studies", "RME", "Our World Our People", "History",
    "Creative Arts", "French", "Ghanaian Language", "BDT", "Career Tech"
  ];

  // --- FORM STATES (Existing) ---
  const [qSubject, setQSubject] = useState("Mathematics");
  const [qGrade, setQGrade] = useState("Class 1"); 
  const [qQuestion, setQQuestion] = useState("");
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");
  const [qAns, setQAns] = useState("a");
  const [isDaily, setIsDaily] = useState(false);

  const [lSubject, setLSubject] = useState("Science");
  const [lGrade, setLGrade] = useState("Class 1");
  const [lTitle, setLTitle] = useState("");
  const [lContent, setLContent] = useState(""); 
  const [lImage, setLImage] = useState("");

  const [vTitle, setVTitle] = useState("");
  const [vCategory, setVCategory] = useState("Science");
  const [vGrade, setVGrade] = useState("all");
  const [vId, setVId] = useState("");

  const [sTitle, setSTitle] = useState("");
  const [sAuthor, setSAuthor] = useState("");
  const [sGrade, setSGrade] = useState("Class 1");
  const [sContent, setSContent] = useState(""); 
  const [sCover, setSCover] = useState("");

  const [bType, setBType] = useState<'objective' | 'theory'>('objective'); 
  const [bYear, setBYear] = useState("2024");
  const [bSubject, setBSubject] = useState("Mathematics");
  const [bQuestion, setBQuestion] = useState("");
  const [bA, setBA] = useState("");
  const [bB, setBB] = useState("");
  const [bC, setBC] = useState("");
  const [bD, setBD] = useState("");
  const [bAns, setBAns] = useState("a"); 
  const [bModelAns, setBModelAns] = useState(""); 

  // --- 🔒 SECURITY CHECK ---
  useEffect(() => {
    const checkPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.is_admin) {
          alert("⛔ Access Denied: You do not have permission to view this page.");
          router.push('/dashboard'); 
          return;
      }
      setVerifying(false);
    };
    checkPermission();
  }, [router]);

  // --- FETCH CONTENT ---
  useEffect(() => {
    if (mode === 'manage' && activeTab !== 'users') fetchContentList();
  }, [mode, activeTab]);

  const fetchContentList = async () => {
      setFetchingList(true);
      let table = 'questions';
      if (activeTab === 'lesson') table = 'lessons';
      if (activeTab === 'video') table = 'videos';
      if (activeTab === 'story') table = 'stories';
      // Users are handled separately via search
      
      const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setContentList(data);
      setFetchingList(false);
  };

  // --- USER MANAGEMENT FUNCTIONS (NEW) ---
  const searchUsers = async () => {
    if (!userSearch) return;
    setFetchingList(true);
    // Search profiles by full_name
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${userSearch}%`)
      .limit(20);
    
    if (data) setUserList(data);
    setFetchingList(false);
  };

  const updateUserGrade = async (userId: string, newGrade: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ grade_level: newGrade })
      .eq('id', userId);

    if (error) {
      alert("Failed to update grade: " + error.message);
    } else {
      // Update local state to reflect change immediately
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, grade_level: newGrade } : u));
      alert(`Student moved to ${newGrade} successfully!`);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this item? This cannot be undone.")) return;
      let table = 'questions';
      if (activeTab === 'lesson') table = 'lessons';
      if (activeTab === 'video') table = 'videos';
      if (activeTab === 'story') table = 'stories';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else setContentList(prev => prev.filter(item => item.id !== id));
  };

  // --- HELPER: INSERT IMAGE ---
  const insertImage = (target: 'quiz' | 'bece' | 'lesson' | 'story') => {
    const url = prompt("Enter the URL of your image/diagram:");
    if (!url) return;
    const markdown = `\n![Diagram](${url})\n`;

    if (target === 'quiz') setQQuestion(prev => prev + markdown);
    if (target === 'bece') setBQuestion(prev => prev + markdown);
    if (target === 'lesson') setLContent(prev => prev + markdown);
    if (target === 'story') setSContent(prev => prev + markdown);
  };

  // --- HELPER: MARKDOWN TOOLBAR ---
  const insertMarkdown = (type: 'bold' | 'header', target: 'lesson' | 'story') => {
    const setContent = target === 'lesson' ? setLContent : setSContent;
    const content = target === 'lesson' ? lContent : sContent;
    if (type === 'bold') setContent(content + "**Bold Text**");
    if (type === 'header') setContent(content + "\n# Heading\n");
  };

  // --- SUBMIT FUNCTIONS ---
  const submitQuiz = async () => {
    setLoading(true);
    const { error } = await supabase.from('questions').insert({
      subject: qSubject.toLowerCase(), grade_level: qGrade, question: qQuestion, 
      a: qA, b: qB, c: qC, answer: qAns, is_daily: isDaily 
    });
    handleResult(error, "Quiz Question Added!");
  };

  const submitLesson = async () => {
    setLoading(true);
    const { error } = await supabase.from('lessons').insert({
      subject: lSubject.toLowerCase(), grade_level: lGrade, title: lTitle, content: lContent, image_url: lImage
    });
    handleResult(error, "Lesson Published!");
  };

  const submitVideo = async () => {
    setLoading(true);
    const { error } = await supabase.from('videos').insert({
      title: vTitle, category: vCategory.toLowerCase(), grade_level: vGrade, video_id: vId
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
    const payload = {
        subject: bSubject.toLowerCase(),
        question: `[${bYear}] ${bQuestion}`,
        a: bType === 'objective' ? bA : null,
        b: bType === 'objective' ? bB : null,
        c: bType === 'objective' ? bC : null,
        d: bType === 'objective' ? bD : null,
        answer: bType === 'objective' ? bAns : bModelAns,
        is_daily: false, grade_level: 'JHS 3'
    };
    const { error } = await supabase.from('questions').insert(payload);
    handleResult(error, `BECE (${bType}) Question Added!`);
  };

  const handleResult = (error: any, successMsg: string) => {
    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setMessage(successMsg);
      setTimeout(() => setMessage(""), 3000);
      setQQuestion(""); setBQuestion(""); setBModelAns(""); setLTitle(""); setVTitle(""); setSTitle("");
    }
  };

  if (verifying) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Lock className="animate-bounce mb-4 text-indigo-500" size={48} /><h1 className="text-xl font-bold">Verifying Credentials...</h1></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} /> Dashboard
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldAlert className="text-indigo-400"/> Admin Panel
            </h1>
        </div>
        <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => setMode('add')} className={`px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'add' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><PlusCircle size={16}/> Add Content</button>
            <button onClick={() => setMode('manage')} className={`px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'manage' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><Trash2 size={16}/> Manage / Delete</button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2">
        <TabButton id="quiz" icon={<Brain size={18}/>} label="Quiz" active={activeTab} set={setActiveTab} />
        <TabButton id="lesson" icon={<BookOpen size={18}/>} label="Textbook" active={activeTab} set={setActiveTab} />
        <TabButton id="video" icon={<Video size={18}/>} label="Video" active={activeTab} set={setActiveTab} />
        <TabButton id="story" icon={<PenTool size={18}/>} label="Story" active={activeTab} set={setActiveTab} />
        <TabButton id="bece" icon={<GraduationCap size={18}/>} label="BECE" active={activeTab} set={setActiveTab} />
        {/* NEW STUDENTS TAB */}
        <TabButton id="users" icon={<Users size={18}/>} label="Students" active={activeTab} set={setActiveTab} />
      </div>

      {/* === 🆕 USER MANAGEMENT TAB === */}
      {activeTab === 'users' && (
          <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-bold text-indigo-300 mb-6 flex items-center gap-2"><Users size={20}/> Manage Student Grades</h2>
              
              {/* Search Bar */}
              <div className="flex gap-2 mb-8">
                  <input 
                    className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl text-white" 
                    placeholder="Search student by name..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <button onClick={searchUsers} className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-500 transition flex items-center gap-2">
                      <Search size={20}/> Search
                  </button>
              </div>

              {/* User List */}
              {fetchingList ? <div className="text-center py-10"><Loader2 className="animate-spin inline"/> Loading...</div> : (
                  <div className="space-y-4">
                      {userList.length === 0 && <p className="text-slate-500 text-center">No students found. Try searching.</p>}
                      {userList.map(student => (
                          <div key={student.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-900 rounded-2xl border border-slate-700 gap-4">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-300">
                                      {student.full_name?.charAt(0) || "U"}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-lg">{student.full_name || "Unknown Student"}</h3>
                                      <p className="text-xs text-slate-500">ID: {student.id.slice(0, 8)}...</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                  <label className="text-xs font-bold text-slate-400 uppercase mr-2">Grade:</label>
                                  <select 
                                    className="bg-slate-800 border border-slate-600 p-2 rounded-lg text-white font-bold"
                                    value={student.grade_level || "Class 1"}
                                    onChange={(e) => updateUserGrade(student.id, e.target.value)}
                                  >
                                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* === ADD CONTENT (Existing) === */}
      {mode === 'add' && activeTab !== 'users' && (
          <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
            {message && <div className="bg-green-500/20 text-green-300 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold animate-pulse"><CheckCircle size={20}/> {message}</div>}

            {/* 1. QUIZ (With Image Button) */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-indigo-300 mb-4">Add Workbook Question</h2>
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qSubject} onChange={e => setQSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qGrade} onChange={e => setQGrade(e.target.value)}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </div>
                
                {/* QUESTION INPUT WITH IMAGE TOOLBAR */}
                <div className="relative">
                    <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl pt-10" rows={4} value={qQuestion} onChange={e => setQQuestion(e.target.value)} placeholder="Type question here..." />
                    <button onClick={() => insertImage('quiz')} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition"><ImageIcon size={14}/> Add Diagram</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option A" value={qA} onChange={e => setQA(e.target.value)} />
                  <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option B" value={qB} onChange={e => setQB(e.target.value)} />
                  <input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Option C" value={qC} onChange={e => setQC(e.target.value)} />
                </div>
                <div className="flex gap-4">
                   <select className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qAns} onChange={e => setQAns(e.target.value)}><option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option></select>
                   <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl flex-1"><input type="checkbox" className="w-5 h-5 accent-indigo-500" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)}/><span className="text-sm font-bold text-white">Daily Challenge?</span></div>
                </div>
                <SubmitBtn loading={loading} onClick={submitQuiz} label="Add Question" />
              </div>
            )}

            {/* 2. LESSON (With Toolbar) */}
            {activeTab === 'lesson' && (
              <div className="space-y-4">
                  <h2 className="text-xl font-bold text-blue-300 mb-4">Publish Textbook Lesson</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lSubject} onChange={e => setLSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lGrade} onChange={e => setLGrade(e.target.value)}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                  </div>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={lTitle} onChange={e => setLTitle(e.target.value)} />
                  
                  <div className="relative">
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <button onClick={() => insertMarkdown('bold', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded"><Bold size={14}/></button>
                          <button onClick={() => insertMarkdown('header', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded"><Type size={14}/></button>
                          <button onClick={() => insertImage('lesson')} className="bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><ImageIcon size={14}/> Add Infographic</button>
                      </div>
                      <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl min-h-[200px] pt-10" rows={8} placeholder="Write your lesson here..." value={lContent} onChange={e => setLContent(e.target.value)} />
                  </div>
                  
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Cover Image URL (optional)" value={lImage} onChange={e => setLImage(e.target.value)} />
                  <SubmitBtn loading={loading} onClick={submitLesson} label="Publish Lesson" />
              </div>
            )}

            {/* 3. VIDEO */}
            {activeTab === 'video' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-red-300 mb-4">Add Lab Video</h2>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Video Title" value={vTitle} onChange={e => setVTitle(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vCategory} onChange={e => setVCategory(e.target.value)}><option value="Science">Science</option><option value="Computing">Computing</option><option value="Crafts">Crafts</option><option value="Math">Math</option></select>
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vGrade} onChange={e => setVGrade(e.target.value)}><option value="all">All Ages</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                  </div>
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="YouTube ID (e.g. dQw4w9WgXcQ)" value={vId} onChange={e => setVId(e.target.value)} />
                  <SubmitBtn loading={loading} onClick={submitVideo} label="Add Video" />
                </div>
            )}

            {/* 4. STORY (With Toolbar) */}
            {activeTab === 'story' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-orange-300 mb-4">Add Storybook</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={sTitle} onChange={e => setSTitle(e.target.value)} />
                    <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Author" value={sAuthor} onChange={e => setSAuthor(e.target.value)} />
                  </div>
                  <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={sGrade} onChange={e => setSGrade(e.target.value)}><option value="all">All Ages</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                  
                  <div className="relative">
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <button onClick={() => insertImage('story')} className="bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><ImageIcon size={14}/> Add Illustration</button>
                      </div>
                      <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl min-h-[200px] pt-10" rows={6} placeholder="Story Content..." value={sContent} onChange={e => setSContent(e.target.value)} />
                  </div>
                  
                  <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Cover URL" value={sCover} onChange={e => setSCover(e.target.value)} />
                  <SubmitBtn loading={loading} onClick={submitStory} label="Publish Story" />
                </div>
            )}

            {/* 5. BECE (With Image Button) */}
            {activeTab === 'bece' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-yellow-300 mb-4">Add BECE Question</h2>
                  <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-4">
                    <button onClick={() => setBType('objective')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${bType === 'objective' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><List size={18}/> Objective</button>
                    <button onClick={() => setBType('theory')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${bType === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><FileText size={18}/> Theory</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bYear} onChange={e => setBYear(e.target.value)}><option>2024</option><option>2023</option><option>2022</option><option>2021</option></select>
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bSubject} onChange={e => setBSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  
                  {/* BECE QUESTION INPUT WITH IMAGE */}
                  <div className="relative">
                      <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl pt-10" rows={3} value={bQuestion} onChange={e => setBQuestion(e.target.value)} placeholder="Question..." />
                      <button onClick={() => insertImage('bece')} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition"><ImageIcon size={14}/> Add Diagram</button>
                  </div>

                  {bType === 'objective' ? (
                    <>
                        <div className="grid grid-cols-2 gap-2"><input className="bg-slate-900 p-3 rounded-xl" placeholder="A" value={bA} onChange={e => setBA(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="B" value={bB} onChange={e => setBB(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="C" value={bC} onChange={e => setBC(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="D" value={bD} onChange={e => setBD(e.target.value)} /></div>
                        <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bAns} onChange={e => setBAns(e.target.value)}><option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option></select>
                    </>
                  ) : (
                    <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={5} placeholder="Model Answer..." value={bModelAns} onChange={e => setBModelAns(e.target.value)} />
                  )}
                  <SubmitBtn loading={loading} onClick={submitBECE} label="Add BECE Question" />
                </div>
            )}
          </div>
      )}

      {/* === MANAGE MODE (Existing) === */}
      {mode === 'manage' && activeTab !== 'users' && (
          <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-red-400 flex items-center gap-2"><Trash2 size={20}/> Manage {activeTab.toUpperCase()}S</h2>
                  <span className="text-xs font-bold bg-slate-900 px-3 py-1 rounded-full text-slate-400">{contentList.length} Items</span>
              </div>
              {fetchingList ? <div className="text-center py-10">Loading...</div> : (
                  <div className="space-y-3">
                      {contentList.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700">
                              <div className="truncate pr-4"><h3 className="font-bold text-white truncate">{item.title || item.question || "Untitled"}</h3><p className="text-xs text-slate-500 uppercase">{item.grade_level || 'All'} • {item.subject || item.category}</p></div>
                              <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 size={18}/></button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}

function TabButton({id, icon, label, active, set}: any) {
  return <button onClick={() => set(id)} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${active === id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{icon} {label}</button>;
}

function SubmitBtn({loading, onClick, label}: any) {
  return <button disabled={loading} onClick={onClick} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition mt-4 flex justify-center items-center gap-2">{loading ? "Processing..." : <><PlusCircle size={20}/> {label}</>}</button>;
}
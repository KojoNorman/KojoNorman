'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, PlusCircle, CheckCircle, Trash2,
  BookOpen, Video, Brain, PenTool, 
  GraduationCap, ShieldAlert, FileText, List, Image as ImageIcon, Bold, Type, Lock, Users, Search, Save, Loader2, Building2, CreditCard, Edit, X
} from 'lucide-react';
import mammoth from 'mammoth';

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [mode, setMode] = useState<'add' | 'manage'>('add'); 
  const [activeTab, setActiveTab] = useState('quiz');
  const [message, setMessage] = useState("");
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [contentList, setContentList] = useState<any[]>([]);
  const [fetchingList, setFetchingList] = useState(false);

  // --- STATE LISTS ---
  const [userSearch, setUserSearch] = useState("");
  const [userList, setUserList] = useState<any[]>([]);
  const [schoolList, setSchoolList] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const subjects = [
    "Mathematics", "English Language", "Science", "Computing",
    "Social Studies", "RME", "Our World Our People", "History",
    "Creative Arts", "French", "Ghanaian Language", "BDT", "Career Tech"
  ];

  // --- FORM STATES ---
  const [qSubject, setQSubject] = useState(subjects[0]);
  const [qGrade, setQGrade] = useState(grades[0]); 
  const [qQuestion, setQQuestion] = useState("");
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");
  const [qC, setQC] = useState("");
  const [qAns, setQAns] = useState("a");
  const [isDaily, setIsDaily] = useState(false);

  const [lSubject, setLSubject] = useState(subjects[0]);
  const [lGrade, setLGrade] = useState(grades[0]);
  const [lTitle, setLTitle] = useState("");
  const [lContent, setLContent] = useState(""); 
  const [lImage, setLImage] = useState("");

  const [vTitle, setVTitle] = useState("");
  const [vCategory, setVCategory] = useState(subjects[0]);
  const [vGrade, setVGrade] = useState("all");
  const [vId, setVId] = useState("");

  const [sTitle, setSTitle] = useState("");
  const [sAuthor, setSAuthor] = useState("");
  const [sGrade, setSGrade] = useState("all");
  const [sContent, setSContent] = useState(""); 
  const [sCover, setSCover] = useState("");

  const [bType, setBType] = useState<'objective' | 'theory'>('objective'); 
  const [bYear, setBYear] = useState("2024");
  const [bSubject, setBSubject] = useState(subjects[0]);
  const [bQuestion, setBQuestion] = useState("");
  const [bA, setBA] = useState("");
  const [bB, setBB] = useState("");
  const [bC, setBC] = useState("");
  const [bD, setBD] = useState("");
  const [bAns, setBAns] = useState("a"); 
  const [bModelAns, setBModelAns] = useState(""); 

  // --- SECURITY ---
  useEffect(() => {
    const checkPermission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (!profile || !profile.is_admin) { alert("⛔ Access Denied."); router.push('/dashboard'); return; }
      setVerifying(false);
    };
    checkPermission();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'schools') fetchUnverifiedSchools();
    else if (mode === 'manage' && activeTab !== 'users') fetchContentList();
  }, [mode, activeTab]);

  const fetchContentList = async () => {
      setFetchingList(true);
      let table = 'questions';
      if (activeTab === 'lesson') table = 'lessons';
      if (activeTab === 'video') table = 'videos';
      if (activeTab === 'story') table = 'stories';
      
      const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setContentList(data);
      setFetchingList(false);
  };

  const resetForms = () => {
      setEditingItem(null);
      setQSubject(subjects[0]); setQGrade(grades[0]); setQQuestion(""); setQA(""); setQB(""); setQC(""); setQAns("a"); setIsDaily(false);
      setLSubject(subjects[0]); setLGrade(grades[0]); setLTitle(""); setLContent(""); setLImage("");
      setVTitle(""); setVCategory(subjects[0]); setVGrade("all"); setVId("");
      setSTitle(""); setSAuthor(""); setSGrade("all"); setSContent(""); setSCover("");
      setBSubject(subjects[0]); setBQuestion(""); setBA(""); setBB(""); setBC(""); setBD(""); setBAns("a"); setBModelAns("");
      if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const startEdit = (item: any) => {
      setEditingItem(item);
      setMode('add');
      
      const findSubject = (val: string) => {
          if (!val) return subjects[0];
          return subjects.find(s => s.toLowerCase() === val.toLowerCase()) || subjects[0];
      };

      if (activeTab === 'quiz') {
          setQSubject(findSubject(item.subject));
          setQGrade(item.grade_level ?? grades[0]);
          setQQuestion(item.question ?? "");
          setQA(item.a ?? ""); setQB(item.b ?? ""); setQC(item.c ?? "");
          setQAns(item.answer ?? "a");
          setIsDaily(item.is_daily ?? false);
      } 
      else if (activeTab === 'lesson') {
          setLSubject(findSubject(item.subject));
          setLGrade(item.grade_level ?? grades[0]);
          setLTitle(item.title ?? "");
          setLContent(item.content ?? "");
          setLImage(item.image_url ?? "");
      }
      else if (activeTab === 'video') {
          setVTitle(item.title ?? "");
          setVCategory(item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : subjects[0]); 
          setVGrade(item.grade_level ?? "all");
          setVId(item.video_id ?? "");
      }
      else if (activeTab === 'story') {
          setSTitle(item.title ?? "");
          setSAuthor(item.author ?? "");
          setSGrade(item.grade_level ?? "all");
          setSContent(item.content ?? "");
          setSCover(item.cover_url ?? "");
      }
      else if (activeTab === 'bece') {
          setBSubject(findSubject(item.subject));
          const yearMatch = item.question ? item.question.match(/^\[(\d{4})\]/) : null;
          if (yearMatch) setBYear(yearMatch[1]);
          setBQuestion(item.question ? item.question.replace(/^\[\d{4}\]\s*/, '') : ""); 
          
          if (item.a) {
              setBType('objective');
              setBA(item.a ?? ""); setBB(item.b ?? ""); setBC(item.c ?? ""); setBD(item.d ?? "");
              setBAns(item.answer ?? "a");
          } else {
              setBType('theory');
              setBModelAns(item.answer ?? "");
          }
      }
  };

  const handleResult = (error: any, successMsg: string) => {
    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setMessage(successMsg);
      setTimeout(() => setMessage(""), 3000);
      resetForms();
      fetchContentList(); 
    }
  };

  // --- SUBMIT HANDLERS ---
  const submitQuiz = async () => {
    setLoading(true);
    const payload = { subject: qSubject.toLowerCase(), grade_level: qGrade, question: qQuestion, a: qA, b: qB, c: qC, answer: qAns, is_daily: isDaily };
    let error;
    if (editingItem) ({ error } = await supabase.from('questions').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('questions').insert(payload));
    handleResult(error, editingItem ? "Question Updated!" : "Quiz Question Added!");
  };

  const submitLesson = async () => {
    setLoading(true);
    const payload = { subject: lSubject.toLowerCase(), grade_level: lGrade, title: lTitle, content: lContent, image_url: lImage };
    let error;
    if (editingItem) ({ error } = await supabase.from('lessons').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('lessons').insert(payload));
    handleResult(error, editingItem ? "Lesson Updated!" : "Lesson Published!");
  };

  const submitVideo = async () => {
    setLoading(true);
    const payload = { title: vTitle, category: vCategory.toLowerCase(), grade_level: vGrade, video_id: vId };
    let error;
    if (editingItem) ({ error } = await supabase.from('videos').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('videos').insert(payload));
    handleResult(error, editingItem ? "Video Updated!" : "Video Added!");
  };

  const submitStory = async () => {
    setLoading(true);
    const payload = { title: sTitle, author: sAuthor, grade_level: sGrade, content: sContent, cover_url: sCover };
    let error;
    if (editingItem) ({ error } = await supabase.from('stories').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('stories').insert(payload));
    handleResult(error, editingItem ? "Story Updated!" : "Story Added!");
  };

  const submitBECE = async () => {
    setLoading(true);
    const payload = {
        subject: bSubject.toLowerCase(),
        question: `[${bYear}] ${bQuestion}`,
        a: bType === 'objective' ? bA : null, b: bType === 'objective' ? bB : null, c: bType === 'objective' ? bC : null, d: bType === 'objective' ? bD : null,
        answer: bType === 'objective' ? bAns : bModelAns,
        is_daily: false, grade_level: 'JHS 3'
    };
    let error;
    if (editingItem) ({ error } = await supabase.from('questions').update(payload).eq('id', editingItem.id));
    else ({ error } = await supabase.from('questions').insert(payload));
    handleResult(error, editingItem ? "BECE Updated!" : `BECE (${bType}) Question Added!`);
  };

  // --- HELPERS (HYBRID MODE: HTML TAGS) ---
  const insertImage = (target: string) => {
    const url = prompt("Enter the URL of your image/diagram:");
    if (!url) return;
    
    // ✅ Compact HTML to prevent spacing issues
    const html = `<img src="${url}" alt="Diagram" class="w-full rounded-lg my-4 shadow-md" />`;
    
    if (target === 'quiz') setQQuestion(prev => prev + html);
    if (target === 'bece') setBQuestion(prev => prev + html);
    if (target === 'lesson') setLContent(prev => prev + html);
    if (target === 'story') setSContent(prev => prev + html);
  };

  // ✅ UPDATED: Compact HTML strings with reduced margins and NEW Table Support
  const insertMarkdown = (type: string, target: string) => { 
    const setContent = target === 'lesson' ? setLContent : setSContent;
    const content = target === 'lesson' ? lContent : sContent;
    
    if (type === 'bold') setContent(content + " <b>Bold Text</b> ");
    if (type === 'header') setContent(content + `<h2 class='text-2xl font-bold text-indigo-700 my-4'>Heading</h2>`);
    
    // ✅ NEW: Insert Table Template
    if (type === 'table') {
        const html = `<div class="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm"><table class="min-w-full divide-y divide-slate-200 bg-white text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-3 text-left font-black text-slate-900 uppercase">Header 1</th><th class="px-4 py-3 text-left font-black text-slate-900 uppercase">Header 2</th></tr></thead><tbody class="divide-y divide-slate-200"><tr><td class="px-4 py-3 font-bold text-slate-900">Row 1 Col 1</td><td class="px-4 py-3 text-slate-600">Row 1 Col 2</td></tr><tr><td class="px-4 py-3 font-bold text-slate-900">Row 2 Col 1</td><td class="px-4 py-3 text-slate-600">Row 2 Col 2</td></tr></tbody></table></div>`;
        setContent(content + html);
    }

    // ✅ NEW: Insight Box with my-2 (reduced margin)
    if (type === 'insight') {
        const html = `<div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-2 rounded-r-xl shadow-sm"><h4 class="font-black text-blue-800 text-lg m-0 flex items-center gap-2">💡 Key Insight</h4><p class="text-blue-900 text-sm leading-relaxed m-0 mt-1">Write your insight here...</p></div>`;
        setContent(content + html);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this item? This cannot be undone.")) return;
      let table = 'questions';
      if (activeTab === 'lesson') table = 'lessons';
      if (activeTab === 'video') table = 'videos';
      if (activeTab === 'story') table = 'stories';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
          alert("Error: " + error.message);
      } else {
          setContentList(prev => prev.filter(item => item.id !== id));
          alert("Item deleted successfully.");
      }
  };

  // --- BULK UPLOAD LOGIC ---
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    setMessage("Reading document...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
      await processParsedContent(result.value);
    };
    reader.readAsArrayBuffer(file);
  };

  const processParsedContent = async (html: string) => {
    setMessage("Parsing content...");

    // ✅ THE FIX: Un-escape the HTML tags that Mammoth converted into safe text!
    // This turns "&lt;h1&gt;" back into "<h1>" so the browser reads it as real code.
    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    // Convert [INSIGHT] tags into HTML boxes
    html = html.replace(
        /\[INSIGHT\](.*?)(?=<|$)/gi, 
        '<div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-2 rounded-r-lg shadow-sm"><h4 class="text-lg font-bold text-blue-800 mb-1">💡 Insight</h4><p class="text-blue-700 text-sm">$1</p></div>'
    );

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = Array.from(doc.body.children);

    let currentSection = '';
    let currentData: any = {};
    
    for (let el of elements) {
      const text = el.textContent?.trim() || "";

      // 1. DETECT LESSON START
      if (text.includes('[LESSON]')) {
        if (currentSection === 'LESSON') await saveLessonToSupabase(currentData);
        if (currentSection === 'QUIZ') await saveQuizToSupabase(currentData);

        currentSection = 'LESSON';
        const title = text.replace(/\[LESSON\]/i, '').trim(); 
        currentData = { title, content: '', subject: qSubject, grade: qGrade };
        continue;
      }

      // 2. DETECT QUIZ START
      if (text.includes('[QUIZ]')) {
        if (currentSection === 'LESSON') await saveLessonToSupabase(currentData);
        if (currentSection === 'QUIZ') await saveQuizToSupabase(currentData);

        currentSection = 'QUIZ';
        currentData = { question: '', a: '', b: '', c: '', answer: 'a', subject: qSubject, grade: qGrade };
        continue;
      }

      // 3. PROCESS LESSON CONTENT
      if (currentSection === 'LESSON') {
        if (text.toLowerCase().startsWith('subject:')) {
            currentData.subject = text.split(':')[1].trim().toLowerCase();
        } else if (text.toLowerCase().startsWith('grade:')) {
            currentData.grade = text.split(':')[1].trim();
        } else {
            // ✅ Clean up empty paragraphs caused by Word spacing
            if (text !== "" || el.innerHTML.includes('<img') || el.innerHTML.includes('<table')) {
                currentData.content += el.outerHTML; 
            }
        }
      }

      // 4. PROCESS QUIZ CONTENT
      if (currentSection === 'QUIZ') {
        if (text.startsWith('Q:') || text.match(/^\d+\./)) {
           if (currentData.question) await saveQuizToSupabase(currentData);
           
           currentData = { 
             question: text.replace(/^(Q:|Q\d+:|\d+\.)\s*/i, '').trim(), 
             a: '', b: '', c: '', answer: 'a', 
             subject: currentData.subject || qSubject, 
             grade: currentData.grade || qGrade
           };
        } 
        else if (text.toLowerCase().startsWith('subject:')) currentData.subject = text.split(':')[1].trim().toLowerCase();
        else if (text.toLowerCase().startsWith('grade:')) currentData.grade = text.split(':')[1].trim();
        else if (text.match(/^[aA]\)/)) currentData.a = text.replace(/^[aA]\)\s*/, '').trim();
        else if (text.match(/^[bB]\)/)) currentData.b = text.replace(/^[bB]\)\s*/, '').trim();
        else if (text.match(/^[cC]\)/)) currentData.c = text.replace(/^[cC]\)\s*/, '').trim();
        else if (text.toLowerCase().startsWith('answer:')) {
            const ans = text.split(':')[1].trim().toLowerCase();
            currentData.answer = ans.charAt(0); 
        }
      }
    }

    // Save final item
    if (currentSection === 'LESSON') await saveLessonToSupabase(currentData);
    if (currentSection === 'QUIZ') await saveQuizToSupabase(currentData);

    setUploadingDoc(false);
    setMessage("Bulk Upload Complete!");
    fetchContentList(); 
  };

  const saveLessonToSupabase = async (data: any) => {
    if (!data.title) return;
    await supabase.from('lessons').insert({
        title: data.title, 
        subject: data.subject?.toLowerCase() || 'general', 
        grade_level: data.grade || 'Class 1', 
        content: data.content
    });
  };

  const saveQuizToSupabase = async (data: any) => {
    if (!data.question) return;
    await supabase.from('questions').insert({
        question: data.question, 
        a: data.a, b: data.b, c: data.c, 
        answer: data.answer, 
        subject: data.subject?.toLowerCase() || 'general', 
        grade_level: data.grade || 'Class 1'
    });
  };

  // --- BULK / USER / SCHOOL (Standard) ---
  const fetchUnverifiedSchools = async () => {
      setFetchingList(true);
      const { data } = await supabase.from('profiles').select('school_name_manual, region').not('school_name_manual', 'is', null).is('school_id', null);
      const unique = Array.from(new Set(data?.map(s => s.school_name_manual))).map(name => data?.find(s => s.school_name_manual === name));
      setSchoolList(unique || []);
      setFetchingList(false);
  };
  const approveSchool = async (name: string, region: string) => {
      if(!confirm(`Add "${name}" to official school list?`)) return;
      const { data: school } = await supabase.from('schools').insert({ name, region }).select().single();
      if (school) {
          await supabase.from('profiles').update({ school_id: school.id, school_name_manual: null }).eq('school_name_manual', name);
          alert("School Approved & Students Linked!");
          fetchUnverifiedSchools();
      }
  };
  const searchUsers = async () => {
    if (!userSearch) return;
    setFetchingList(true);
    const { data } = await supabase.from('profiles').select('*').ilike('full_name', `%${userSearch}%`).limit(20);
    if (data) setUserList(data);
    setFetchingList(false);
  };
  const updateUserGrade = async (userId: string, newGrade: string) => {
    const { error } = await supabase.from('profiles').update({ grade_level: newGrade }).eq('id', userId);
    if (!error) { setUserList(prev => prev.map(u => u.id === userId ? { ...u, grade_level: newGrade } : u)); alert(`Student moved to ${newGrade}!`); }
  };
  const activateSubscription = async (userId: string) => {
      if(!confirm("Manually activate Termly Subscription for this user?")) return;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90); 
      const { error } = await supabase.from('subscriptions').upsert({ user_id: userId, status: 'active', start_date: startDate.toISOString(), end_date: endDate.toISOString(), plan_type: 'termly' });
      if (!error) { await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', userId); alert("Subscription Activated!"); searchUsers(); }
  };

  if (verifying) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Lock className="animate-bounce mb-4 text-indigo-500" size={48} /><h1 className="text-xl font-bold">Verifying Credentials...</h1></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition"><ArrowLeft size={20} /> Dashboard</Link>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><ShieldAlert className="text-indigo-400"/> Admin Panel</h1>
        </div>
        <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
            <button onClick={() => { setMode('add'); resetForms(); }} className={`px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'add' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><PlusCircle size={16}/> Add Content</button>
            <button onClick={() => { setMode('manage'); resetForms(); }} className={`px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${mode === 'manage' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><Trash2 size={16}/> Manage / Edit</button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 overflow-x-auto pb-2">
        <TabButton id="quiz" icon={<Brain size={18}/>} label="Quiz" active={activeTab} set={setActiveTab} />
        <TabButton id="lesson" icon={<BookOpen size={18}/>} label="Textbook" active={activeTab} set={setActiveTab} />
        <TabButton id="video" icon={<Video size={18}/>} label="Video" active={activeTab} set={setActiveTab} />
        <TabButton id="story" icon={<PenTool size={18}/>} label="Story" active={activeTab} set={setActiveTab} />
        <TabButton id="bece" icon={<GraduationCap size={18}/>} label="BECE" active={activeTab} set={setActiveTab} />
        <TabButton id="bulk" icon={<FileText size={18}/>} label="Bulk Upload" active={activeTab} set={setActiveTab} />
        <TabButton id="users" icon={<Users size={18}/>} label="Students" active={activeTab} set={setActiveTab} />
        <TabButton id="schools" icon={<Building2 size={18}/>} label="Schools" active={activeTab} set={setActiveTab} />
      </div>

      {/* RENDER CONTENT */}
      {(activeTab === 'schools' || activeTab === 'users' || activeTab === 'bulk') ? (
          activeTab === 'schools' ? (
            <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-bold text-yellow-300 mb-6 flex items-center gap-2"><Building2 size={20}/> Unverified Schools</h2>
              {schoolList.length === 0 ? <p className="text-slate-500">No pending schools.</p> : (
                  <div className="space-y-3">{schoolList.map((s, idx) => (<div key={idx} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700"><div><h3 className="font-bold text-white">{s.school_name_manual}</h3><p className="text-xs text-slate-500">{s.region}</p></div><button onClick={() => approveSchool(s.school_name_manual, s.region)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Approve</button></div>))}</div>
              )}
            </div>
          ) : activeTab === 'users' ? (
            <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-bold text-indigo-300 mb-6 flex items-center gap-2"><Users size={20}/> Student Management</h2>
              <div className="flex gap-2 mb-8"><input className="flex-1 bg-slate-900 border border-slate-700 p-4 rounded-xl text-white" placeholder="Search student..." value={userSearch ?? ""} onChange={(e) => setUserSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers()} /><button onClick={searchUsers} className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-500 transition flex items-center gap-2"><Search size={20}/> Search</button></div>
              {fetchingList ? <div className="text-center py-10"><Loader2 className="animate-spin inline"/> Loading...</div> : (<div className="space-y-4">{userList.map(student => (<div key={student.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-900 rounded-2xl border border-slate-700 gap-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-300">{student.full_name?.charAt(0) || "U"}</div><div><h3 className="font-bold text-lg">{student.full_name}</h3><p className="text-xs text-slate-500">{student.grade_level} • {student.subscription_status}</p></div></div><div className="flex items-center gap-2 w-full md:w-auto"><select className="bg-slate-800 border border-slate-600 p-2 rounded-lg text-white font-bold text-sm" value={student.grade_level || "Class 1"} onChange={(e) => updateUserGrade(student.id, e.target.value)}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select><button onClick={() => activateSubscription(student.id)} className="bg-green-600/20 text-green-400 p-2 rounded-lg hover:bg-green-600 hover:text-white transition" title="Activate Subscription"><CreditCard size={18}/></button></div></div>))}</div>)}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center">
              <h2 className="text-xl font-bold text-green-300 mb-4">Upload Word Document</h2>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-10 hover:border-indigo-500 transition cursor-pointer relative">
                  <input key={uploadingDoc ? 'loading' : 'input'} ref={fileInputRef} type="file" accept=".docx" onChange={handleDocUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {uploadingDoc ? <div className="flex flex-col items-center"><Loader2 className="animate-spin text-indigo-500 mb-2" size={40} /><p>Parsing...</p></div> : <div className="flex flex-col items-center text-slate-300"><FileText size={48} className="mb-4 text-indigo-400"/><p className="font-bold text-lg">Click to Upload Word Doc</p></div>}
              </div>
            </div>
          )
      ) : (
          <>
            {mode === 'add' && (
              <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
                {editingItem && <div className="absolute top-0 right-0 p-4"><button onClick={resetForms} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-600 transition"><X size={16}/> Cancel Edit</button></div>}
                {message && <div className="bg-green-500/20 text-green-300 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold animate-pulse"><CheckCircle size={20}/> {message}</div>}

                {/* --- QUIZ FORM --- */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-indigo-300 mb-4">{editingItem ? "Edit Question" : "Add Workbook Question"}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qSubject ?? ""} onChange={e => setQSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qGrade ?? ""} onChange={e => setQGrade(e.target.value)}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    </div>
                    <div className="relative"><textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl pt-10" rows={4} value={qQuestion ?? ""} onChange={e => setQQuestion(e.target.value)} placeholder="Type question here..." /><button onClick={() => insertImage('quiz')} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><ImageIcon size={14}/> Add Diagram</button></div>
                    <div className="grid grid-cols-3 gap-2"><input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="A" value={qA ?? ""} onChange={e => setQA(e.target.value)} /><input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="B" value={qB ?? ""} onChange={e => setQB(e.target.value)} /><input className="bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="C" value={qC ?? ""} onChange={e => setQC(e.target.value)} /></div>
                    <div className="flex gap-4"><select className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-xl" value={qAns ?? ""} onChange={e => setQAns(e.target.value)}><option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option></select><div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl flex-1"><input type="checkbox" className="w-5 h-5 accent-indigo-500" checked={isDaily ?? false} onChange={(e) => setIsDaily(e.target.checked)}/><span className="text-sm font-bold text-white">Daily Challenge?</span></div></div>
                    <SubmitBtn loading={loading} onClick={submitQuiz} label={editingItem ? "Update Question" : "Add Question"} />
                  </div>
                )}

                {/* --- LESSON FORM --- */}
                {activeTab === 'lesson' && (
                  <div className="space-y-4">
                      <h2 className="text-xl font-bold text-blue-300 mb-4">{editingItem ? "Edit Lesson" : "Publish Textbook Lesson"}</h2>
                      <div className="grid grid-cols-2 gap-4"><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lSubject ?? ""} onChange={e => setLSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={lGrade ?? ""} onChange={e => setLGrade(e.target.value)}>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                      <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={lTitle ?? ""} onChange={e => setLTitle(e.target.value)} />
                      <div className="relative">
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                            {/* ✅ NEW: Table & Insight Buttons */}
                            <button onClick={() => insertMarkdown('bold', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded"><Bold size={14}/></button>
                            <button onClick={() => insertMarkdown('header', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded"><Type size={14}/></button>
                            <button onClick={() => insertMarkdown('table', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-green-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><List size={14}/> Table</button>
                            <button onClick={() => insertMarkdown('insight', 'lesson')} className="bg-slate-700 hover:bg-slate-600 text-yellow-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">💡 Insight</button>
                            <button onClick={() => insertImage('lesson')} className="bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><ImageIcon size={14}/> Add Infographic</button>
                        </div>
                        <textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl min-h-50 pt-10" rows={8} placeholder="Write your lesson here..." value={lContent ?? ""} onChange={e => setLContent(e.target.value)} />
                      </div>
                      <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Cover Image URL (optional)" value={lImage ?? ""} onChange={e => setLImage(e.target.value)} />
                      <SubmitBtn loading={loading} onClick={submitLesson} label={editingItem ? "Update Lesson" : "Publish Lesson"} />
                  </div>
                )}

                {/* --- VIDEO FORM --- */}
                {activeTab === 'video' && (
                  <div className="space-y-4">
                      <h2 className="text-xl font-bold text-red-300 mb-4">{editingItem ? "Edit Video" : "Add Lab Video"}</h2>
                      <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Video Title" value={vTitle ?? ""} onChange={e => setVTitle(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4"><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vCategory ?? ""} onChange={e => setVCategory(e.target.value)}><option value="Science">Science</option><option value="Computing">Computing</option><option value="Crafts">Crafts</option><option value="Math">Math</option></select><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={vGrade ?? ""} onChange={e => setVGrade(e.target.value)}><option value="all">All Ages</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                      <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="YouTube ID (e.g. dQw4w9WgXcQ)" value={vId ?? ""} onChange={e => setVId(e.target.value)} />
                      <SubmitBtn loading={loading} onClick={submitVideo} label={editingItem ? "Update Video" : "Add Video"} />
                  </div>
                )}

                {/* --- STORY FORM --- */}
                {activeTab === 'story' && (
                  <div className="space-y-4">
                      <h2 className="text-xl font-bold text-orange-300 mb-4">{editingItem ? "Edit Story" : "Add Storybook"}</h2>
                      <div className="grid grid-cols-2 gap-4"><input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Title" value={sTitle ?? ""} onChange={e => setSTitle(e.target.value)} /><input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Author" value={sAuthor ?? ""} onChange={e => setSAuthor(e.target.value)} /></div>
                      <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={sGrade ?? ""} onChange={e => setSGrade(e.target.value)}><option value="all">All Ages</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                      <div className="relative"><div className="absolute top-2 right-2 flex gap-2 z-10"><button onClick={() => insertImage('story')} className="bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><ImageIcon size={14}/> Add Illustration</button></div><textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl min-h-50 pt-10" rows={6} placeholder="Story Content..." value={sContent ?? ""} onChange={e => setSContent(e.target.value)} /></div>
                      <input className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Cover URL" value={sCover ?? ""} onChange={e => setSCover(e.target.value)} />
                      <SubmitBtn loading={loading} onClick={submitStory} label={editingItem ? "Update Story" : "Publish Story"} />
                  </div>
                )}

                {/* --- BECE FORM --- */}
                {activeTab === 'bece' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-yellow-300 mb-4">{editingItem ? "Edit BECE Question" : "Add BECE Question"}</h2>
                      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-4"><button onClick={() => setBType('objective')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${bType === 'objective' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><List size={18}/> Objective</button><button onClick={() => setBType('theory')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${bType === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><FileText size={18}/> Theory</button></div>
                      <div className="grid grid-cols-2 gap-4"><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bYear ?? ""} onChange={e => setBYear(e.target.value)}><option>2024</option><option>2023</option><option>2022</option><option>2021</option></select><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bSubject ?? ""} onChange={e => setBSubject(e.target.value)}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div className="relative"><textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl pt-10" rows={3} value={bQuestion ?? ""} onChange={e => setBQuestion(e.target.value)} placeholder="Question..." /><button onClick={() => insertImage('bece')} className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-bold px-3 py-1 rounded flex items-center gap-1 transition"><ImageIcon size={14}/> Add Diagram</button></div>
                      {bType === 'objective' ? (<><div className="grid grid-cols-2 gap-2"><input className="bg-slate-900 p-3 rounded-xl" placeholder="A" value={bA ?? ""} onChange={e => setBA(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="B" value={bB ?? ""} onChange={e => setBB(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="C" value={bC ?? ""} onChange={e => setBC(e.target.value)} /><input className="bg-slate-900 p-3 rounded-xl" placeholder="D" value={bD ?? ""} onChange={e => setBD(e.target.value)} /></div><select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" value={bAns ?? ""} onChange={e => setBAns(e.target.value)}><option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option></select></>) : (<textarea className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" rows={5} placeholder="Model Answer..." value={bModelAns ?? ""} onChange={e => setBModelAns(e.target.value)} />)}
                      <SubmitBtn loading={loading} onClick={submitBECE} label={editingItem ? "Update BECE" : "Add BECE Question"} />
                    </div>
                )}
              </div>
            )}

            {mode === 'manage' && (
              <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-red-400 flex items-center gap-2"><Trash2 size={20}/> Manage {activeTab.toUpperCase()}S</h2><span className="text-xs font-bold bg-slate-900 px-3 py-1 rounded-full text-slate-400">{contentList.length} Items</span></div>
                  {fetchingList ? <div className="text-center py-10">Loading...</div> : (
                      <div className="space-y-3">{contentList.map(item => (<div key={item.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-700"><div className="truncate pr-4"><h3 className="font-bold text-white truncate">{item.title || item.question || "Untitled"}</h3><p className="text-xs text-slate-500 uppercase">{item.grade_level || 'All'} • {item.subject || item.category}</p></div><div className="flex gap-2"><button onClick={() => startEdit(item)} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition"><Edit size={18}/></button><button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 size={18}/></button></div></div>))}</div>
                  )}
              </div>
            )}
          </>
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
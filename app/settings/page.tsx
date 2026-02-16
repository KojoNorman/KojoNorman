'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, User, Save, LogOut, Loader2, Shield, 
  CheckCircle, GraduationCap, Camera, AlertCircle, History, 
  Phone, MapPin, Building2, CreditCard, Lock
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Data State
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    gradeLevel: "",
    parentPhone: "",
    region: "",
    schoolName: "Not Linked"
  });
  
  const [inventory, setInventory] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [subStatus, setSubStatus] = useState('trial');

  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const regions = ['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono'];

  useEffect(() => {
    fetchProfileAndHistory();
  }, []);

  async function fetchProfileAndHistory() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }

    // 1. Fetch Profile with School Name
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, schools(name)')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser(profile);
      
      // Determine School Display Name
      let displaySchool = "Not Linked";
      if (profile.schools?.name) displaySchool = profile.schools.name;
      else if (profile.school_name_manual) displaySchool = `${profile.school_name_manual} (Pending)`;

      setFormData({
        fullName: profile.full_name || "",
        username: profile.username || "",
        gradeLevel: profile.grade_level || "Class 1",
        parentPhone: profile.parent_phone || "",
        region: profile.region || "",
        schoolName: displaySchool
      });

      setSubStatus(profile.subscription_status || 'trial');
      setInventory(profile.inventory || []);
    }

    // 2. Fetch Exam History
    const { data: exams } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (exams) setHistory(exams);

    setLoading(false);
  }

  // --- UPLOAD LOGIC ---
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (dbError) throw dbError;

      setUser({ ...user, avatar_url: publicUrl });
      setMessage({ type: 'success', text: 'Photo updated successfully!' });
      router.refresh();

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Upload failed: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  // --- SAVE PROFILE ---
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: formData.fullName, 
        username: formData.username,
        parent_phone: formData.parentPhone,
        region: formData.region,
        // Grade is purposefully omitted here if you want it locked, 
        // or add grade_level: formData.gradeLevel if you want it editable.
      })
      .eq('id', user.id);

    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Profile details saved!' });
      router.refresh();
    }
    setSaving(false);
  };

  // --- EQUIP AVATAR ---
  const handleEquipAvatar = async (url: string) => {
    setUser({ ...user, avatar_url: url });
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
           <Link href="/dashboard" className="bg-white p-3 rounded-full shadow-sm text-slate-600 hover:bg-slate-100 transition"><ArrowLeft size={24}/></Link>
           <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
        </div>

        {/* FEEDBACK MESSAGE */}
        {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>} {message.text}
            </div>
        )}

        {/* PROFILE CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 mb-8 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            {/* Status Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${subStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                <CreditCard size={12}/> {subStatus} Plan
            </div>

            <div className="relative mb-6 group">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-md overflow-hidden bg-slate-50 relative">
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-white" size={32}/></div>}
                    <img src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.fullName}`} alt="Avatar" className="w-full h-full object-cover"/>
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full border-4 border-white cursor-pointer hover:bg-indigo-700 hover:scale-110 transition shadow-lg">
                    <Camera size={18}/>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading}/>
                </label>
            </div>
            
            <div className="flex gap-4 text-center divide-x divide-slate-200">
                <div className="px-6"><span className="block text-2xl font-black text-slate-900">{user.coins}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coins</span></div>
                <div className="px-6"><span className="block text-2xl font-black text-slate-900">{user.xp}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total XP</span></div>
            </div>
        </div>

        {/* EDIT DETAILS FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Shield size={20} className="text-indigo-500"/> Account Details</h2>
            
            <div className="space-y-6">
                {/* Row 1: Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Display Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-slate-300" size={18}/>
                            <input value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-slate-300 font-bold">@</span>
                            <input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full p-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition" placeholder="nickname" />
                        </div>
                    </div>
                </div>

                {/* Row 2: Academics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Grade Level</label>
                        <div className="relative group">
                            <GraduationCap className="absolute left-4 top-4 text-slate-400" size={18}/>
                            <select 
                                value={formData.gradeLevel} 
                                disabled={true} // Locked
                                className="w-full p-4 pl-12 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed appearance-none"
                            >
                                <option>{formData.gradeLevel}</option>
                            </select>
                            <Lock size={14} className="absolute right-4 top-5 text-slate-400"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">School</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-4 text-slate-400" size={18}/>
                            <input value={formData.schoolName} disabled className="w-full p-4 pl-12 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Row 3: Contact/Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Parent's Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 text-slate-300" size={18}/>
                            <input value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition" placeholder="050..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Region</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-slate-300" size={18}/>
                            <select 
                                value={formData.region} 
                                onChange={(e) => setFormData({...formData, region: e.target.value})}
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition appearance-none"
                            >
                                <option value="">Select Region</option>
                                {regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full mt-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition flex items-center justify-center gap-2 shadow-lg">
                {saving ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Save Changes
            </button>
        </div>

        {/* AVATAR LOCKER */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><User size={20} className="text-pink-500"/> My Avatars</h2>
            {inventory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-2xl">No avatars owned yet. Visit the Shop!</div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {inventory.map((url, idx) => (
                        <div key={idx} onClick={() => handleEquipAvatar(url)} className={`aspect-square rounded-2xl p-2 cursor-pointer border-2 transition-all relative ${user.avatar_url === url ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 hover:border-indigo-200 bg-slate-50'}`}>
                            <img src={url} className="w-full h-full object-contain"/>
                            {user.avatar_url === url && <div className="absolute top-1 right-1 bg-indigo-500 text-white p-1 rounded-full"><CheckCircle size={12}/></div>}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* EXAM HISTORY */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <History size={20} className="text-orange-500"/> Exam History
            </h2>
            {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-2xl">
                    No exams taken yet. Try the BECE Mock!
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((exam) => {
                        const percent = Math.round((exam.score / exam.total) * 100);
                        const isPass = percent >= 50;
                        return (
                            <div key={exam.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-800 capitalize">{exam.subject}</h4>
                                    <p className="text-xs text-slate-400 font-bold">{new Date(exam.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-xl font-black ${isPass ? 'text-green-600' : 'text-red-500'}`}>{percent}%</span>
                                    <span className="text-xs font-bold text-slate-400">{exam.score}/{exam.total}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2"><LogOut size={20}/> Sign Out</button>

      </div>
    </div>
  );
}
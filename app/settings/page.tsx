'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Camera, Save, Loader2, User, Mail, GraduationCap } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Class 1"); // Default
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // GES / NaCCA Grades List
  const grades = [
    'Class 1', 'Class 2', 'Class 3', 
    'Class 4', 'Class 5', 'Class 6',
    'JHS 1', 'JHS 2', 'JHS 3'
  ];

  // 1. Fetch Real User Data
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, grade_level') 
        .eq('id', user.id)
        .single();

      if (profile) {
        setAvatarUrl(profile.avatar_url);
        
        if (profile.full_name) setDisplayName(profile.full_name);
        else {
          const namePart = user.email?.split('@')[0] || "Student";
          setDisplayName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }

        // Set Grade if it exists, otherwise default to Class 1
        if (profile.grade_level) setGradeLevel(profile.grade_level);
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  // 2. Handle Image Upload
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (userId) {
        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);
          
        setAvatarUrl(publicUrl);
        alert('Avatar updated successfully!');
      }

    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Profile Save (Name + Grade)
  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: displayName,
          grade_level: gradeLevel // <--- SAVING THE GRADE
        })
        .eq('id', userId);

      if (error) throw error;
      
      alert("✅ Profile updated successfully!");
      router.refresh(); // Refresh so Dashboard sees new data
      
    } catch (error: any) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-indigo-600 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900">Profile Settings</h1>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-8">
        
        {/* AVATAR SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-indigo-300">
                <User size={48} />
              </div>
            )}

            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg border-4 border-white">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
            </label>
          </div>
          <p className="mt-4 text-sm text-gray-400 font-bold">Tap camera to upload</p>
        </div>

        {/* DETAILS FORM */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          
          {/* EMAIL (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email Address (Locked)</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 font-bold cursor-not-allowed">
              <Mail size={20} />
              {email}
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Display Name</label>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
              <User size={20} className="text-indigo-500" />
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full outline-none font-bold text-gray-900 placeholder-gray-300"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* GRADE LEVEL SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Class / Grade Level</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                <GraduationCap size={20} />
              </div>
              <select 
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-gray-900 appearance-none cursor-pointer"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
          </button>

        </div>
      </div>
    </div>
  );
}
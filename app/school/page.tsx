'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { 
  Building2, MapPin, Users, Trophy, 
  ArrowLeft, Loader2, GraduationCap, Crown 
} from 'lucide-react';

export default function MySchool() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    // Get user profile to find school_id
    const { data: profile } = await supabase.from('profiles').select('school_id, grade_level').eq('id', user.id).single();

    if (profile?.school_id) {
      // Fetch School Details
      const { data: school } = await supabase.from('schools').select('*').eq('id', profile.school_id).single();
      setSchoolData(school);

      // Fetch Top 3 Students in same school & grade
      const { data: students } = await supabase
        .from('profiles')
        .select('full_name, xp, avatar_url')
        .eq('school_id', profile.school_id)
        .eq('grade_level', profile.grade_level) // Filter by same class
        .order('xp', { ascending: false })
        .limit(3);
      
      setTopStudents(students || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-slate-600"/></button>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Building2 size={28} className="text-indigo-600"/> My School</h1>
        </div>

        {!schoolData ? (
          // UNLINKED STATE
          <div className="bg-white rounded-4xl p-10 text-center shadow-sm border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500"><Building2 size={40}/></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">No School Linked</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Join your school to compete with classmates and access school-specific assignments.</p>
            
            {/* ✅ FIXED BUTTON: Redirects to Settings */}
            <button 
              onClick={() => router.push('/settings')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Find My School
            </button>
          </div>
        ) : (
          // LINKED STATE
          <div className="space-y-6">
            
            {/* School Hero Card */}
            <div className="bg-white rounded-4xl overflow-hidden shadow-sm border border-slate-100 relative">
              <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700"></div>
              <div className="px-8 pb-8 pt-0 relative">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg -mt-12 flex items-center justify-center mb-4 border-4 border-white">
                   {/* School Logo Placeholder */}
                   <GraduationCap size={40} className="text-indigo-600"/>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{schoolData.name}</h2>
                    <p className="text-slate-500 font-medium flex items-center gap-1 mt-1"><MapPin size={16}/> {schoolData.location || "Accra, Ghana"}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Users size={16}/> {schoolData.student_count || 500} Students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Leaderboard */}
            <div className="bg-indigo-900 rounded-4xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Trophy size={150}/></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Crown size={24} className="text-yellow-400"/> Top in Your Class</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {topStudents.map((student, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="font-black text-2xl text-white/50">#{idx + 1}</div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                      {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full rounded-full"/> : student.full_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate w-24">{student.full_name}</p>
                      <p className="text-xs text-indigo-200">{student.xp} XP</p>
                    </div>
                  </div>
                ))}
                {topStudents.length === 0 && <p className="text-indigo-200">Be the first to earn XP in your class!</p>}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
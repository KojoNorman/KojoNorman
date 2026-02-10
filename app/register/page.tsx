'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <--- CORRECT IMPORT
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Rocket, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Sign Up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }, // Store name in metadata
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Create Profile Entry (Critical for Dashboard to work)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            grade_level: 'Class 1', // Default
            coins: 0,
            xp: 0,
            role: 'student'
          });

        // Ignore duplicate key errors if the trigger handled it
        if (profileError && profileError.code !== '23505') {
            console.error("Profile creation error:", profileError);
        }

        // 3. Redirect to Dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-indigo-100 border border-slate-100">
        
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 transform rotate-3">
              <Rocket size={40} />
           </div>
           <h1 className="text-3xl font-black text-slate-800">Create Account</h1>
           <p className="text-slate-400 font-bold text-sm mt-2">Join the fun and start learning!</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-sm">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase ml-2">Full Name</label>
            <div className="relative mt-1">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"><User size={20}/></div>
               <input 
                 type="text" 
                 required
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                 placeholder="Student Name"
               />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase ml-2">Email Address</label>
            <div className="relative mt-1">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"><Mail size={20}/></div>
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                 placeholder="name@example.com"
               />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase ml-2">Password</label>
            <div className="relative mt-1">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"><Lock size={20}/></div>
               <input 
                 type="password" 
                 required
                 minLength={6}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                 placeholder="••••••••"
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up Free"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
           Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log In</Link>
        </p>

      </div>
    </div>
  );
}
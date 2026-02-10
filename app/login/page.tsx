'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, LogIn, UserPlus, GraduationCap, ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // 2. Create Profile (Crucial step for new users)
        if (authData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                full_name: 'Student', // Default name
                grade_level: 'Class 1', 
                coins: 0, 
                xp: 0, 
                role: 'student'
              });
            // Ignore if profile already exists (edge case)
            if (profileError && profileError.code !== '23505') console.error(profileError);
        }

        alert('Account created successfully! Logging you in...');
      } 
      
      // --- LOGIN LOGIC (For both cases) ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Success! Go to Dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      setErrorMsg(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor (Matching Landing Page) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header / Logo Area */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-indigo-100 mb-6 text-indigo-600 hover:scale-110 transition-transform duration-300">
                <GraduationCap size={32} />
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {isSignUp ? "Join the Fun!" : "Welcome Back!"}
            </h1>
            <p className="text-slate-500 font-medium">
                {isSignUp ? "Create an account to start learning." : "Enter your details to access your dashboard."}
            </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100">
            
            {/* Toggle Switch */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 relative">
                {/* Sliding Background */}
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${isSignUp ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
                
                <button 
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${!isSignUp ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Log In
                </button>
                <button 
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${isSignUp ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
                
                {/* Email Input */}
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase ml-3 mb-1 block">Email Address</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-500 transition-colors"><Mail size={20}/></div>
                        <input 
                            type="email" 
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase ml-3 mb-1 block">Password</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-500 transition-colors"><Lock size={20}/></div>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0"/> {errorMsg}
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : isSignUp ? <><UserPlus size={20}/> Create Free Account</> : <><LogIn size={20}/> Start Learning</>}
                </button>
            </form>

        </div>
        
        {/* Footer Link */}
        <div className="text-center mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-indigo-600 transition">
                <ArrowLeft size={16}/> Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}
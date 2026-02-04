'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, LogIn, UserPlus, GraduationCap } from 'lucide-react';

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Account created! Logging you in...');
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
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* LOGO AREA */}
      <div className="text-center mb-8 text-white">
        <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
          <GraduationCap size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter">
          E-WORKBOOK<span className="text-orange-400">.io</span>
        </h1>
        <p className="text-indigo-200 mt-2 font-medium">Master Math, Science & Computing</p>
      </div>

      {/* CARD */}
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border-4 border-indigo-500/30">
        
        {/* TOGGLE TABS */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${!isSignUp ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${isSignUp ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-gray-700 transition"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-gray-700 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? <><UserPlus size={20}/> Create Account</> : <><LogIn size={20}/> Start Learning</>}
          </button>
        </form>

      </div>
      
      <p className="mt-8 text-indigo-300 text-sm font-medium">
        © 2026 E-Workbook. All rights reserved.
      </p>

    </div>
  );
}
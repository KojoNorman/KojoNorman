'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, LogIn, UserPlus, GraduationCap, ArrowLeft, Mail, Lock, AlertCircle, 
  User, Phone, MapPin, School, ChevronRight, CheckCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Signup Wizard Step (1: Basics, 2: Academic, 3: Guardian)
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Data State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '', // Used as Login ID
    gradeLevel: 'Class 1',
    region: 'Greater Accra',
    schoolName: '',
    parentPhone: ''
  });

  const grades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const regions = ['Greater Accra', 'Ashanti', 'Central', 'Western', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- SIGNUP WIZARD LOGIC ---
  const handleNextStep = () => {
    if (step === 1 && (!formData.fullName || !formData.phone || !formData.email || !formData.password)) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (step === 2 && (!formData.schoolName)) {
        setErrorMsg("Please enter your school name.");
        return;
    }
    setErrorMsg('');
    setStep(step + 1);
  };

  const handleSignupSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: { full_name: formData.fullName } // Metadata
            }
        });
        if (authError) throw authError;

        if (authData.user) {
            // 2. Insert Complete Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    full_name: formData.fullName,
                    phone_number: formData.phone, // Login Phone
                    grade_level: formData.gradeLevel,
                    school_name_manual: formData.schoolName, // Storing manually for now
                    parent_phone: formData.parentPhone || formData.phone, // Fallback to student phone
                    subscription_status: 'trial', // Default
                    xp: 0,
                    coins: 0
                });

            if (profileError) throw profileError;
        }

        alert("Account created! Please log in.");
        setAuthMode('login');
        setStep(1); // Reset

    } catch (error: any) {
        setErrorMsg(error.message || "Signup failed. Try again.");
    } finally {
        setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const StepIndicator = () => (
      <div className="flex gap-2 mb-6 justify-center">
          {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}></div>
          ))}
      </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-indigo-100 mb-6 text-indigo-600 hover:scale-110 transition-transform duration-300">
                <GraduationCap size={32} />
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {authMode === 'signup' ? (step === 1 ? "Who are you?" : step === 2 ? "Your Academics" : "Parent Info") : "Welcome Back!"}
            </h1>
            <p className="text-slate-500 font-medium">
                {authMode === 'signup' ? "Let's set up your profile." : "Enter your details to access your dashboard."}
            </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100">
            
            {/* Toggle Switch (Only visible on Login or Step 1) */}
            {step === 1 && (
                <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 relative">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${authMode === 'signup' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
                    <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${authMode === 'login' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Log In</button>
                    <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${authMode === 'signup' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Sign Up</button>
                </div>
            )}

            {authMode === 'signup' && <StepIndicator />}

            <form onSubmit={authMode === 'login' ? handleLogin : (e) => e.preventDefault()} className="space-y-5">
                
                {/* --- LOGIN FORM --- */}
                {authMode === 'login' && (
                    <>
                        <InputGroup icon={<Mail/>} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                        <InputGroup icon={<Lock/>} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
                        <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all mt-4">
                            {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20}/> Start Learning</>}
                        </button>
                    </>
                )}

                {/* --- SIGNUP WIZARD --- */}
                {authMode === 'signup' && (
                    <>
                        {/* Step 1: Basics */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                                <InputGroup icon={<User/>} name="fullName" placeholder="Full Name (e.g. Kofi Boateng)" value={formData.fullName} onChange={handleInputChange} />
                                <InputGroup icon={<Phone/>} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                                <InputGroup icon={<Mail/>} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                                <InputGroup icon={<Lock/>} name="password" type="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} />
                                <button type="button" onClick={handleNextStep} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 mt-4">Next Step <ChevronRight size={20}/></button>
                            </div>
                        )}

                        {/* Step 2: Academics */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase ml-3 mb-1 block">Grade Level</label>
                                    <div className="relative"><select name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="w-full pl-4 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 appearance-none">{grades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase ml-3 mb-1 block">Region</label>
                                    <div className="relative"><select name="region" value={formData.region} onChange={handleInputChange} className="w-full pl-4 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 appearance-none">{regions.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                                </div>
                                <InputGroup icon={<School/>} name="schoolName" placeholder="School Name" value={formData.schoolName} onChange={handleInputChange} />
                                <div className="flex gap-2 mt-4">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Back</button>
                                    <button type="button" onClick={handleNextStep} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2">Next Step <ChevronRight size={20}/></button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Guardian */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-orange-800 text-sm font-medium mb-4">
                                    <p>We need a parent's number for subscription alerts (Momo). Keep this accurate!</p>
                                </div>
                                <InputGroup icon={<Phone/>} name="parentPhone" placeholder="Parent/Guardian Phone" value={formData.parentPhone} onChange={handleInputChange} />
                                
                                <div className="flex gap-2 mt-4">
                                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Back</button>
                                    <button type="button" onClick={handleSignupSubmit} disabled={loading} className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                                        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> Complete Signup</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Error Display */}
                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0"/> {errorMsg}
                    </div>
                )}

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

// Helper Component for Inputs
const InputGroup = ({ icon, name, type = "text", placeholder, value, onChange }: any) => (
    <div>
        <label className="text-xs font-black text-slate-400 uppercase ml-3 mb-1 block">{placeholder}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-500 transition-colors">{icon}</div>
            <input 
                name={name}
                type={type} 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);
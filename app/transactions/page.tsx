'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { 
  CreditCard, Calendar, History, ArrowLeft, 
  CheckCircle, AlertCircle, Loader2, Receipt 
} from 'lucide-react';

export default function Transactions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    // Fetch Subscription Status
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
    setSubscription(sub);

    // Fetch Transaction History
    const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setTransactions(txs || []);
    
    setLoading(false);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  const isActive = subscription?.status === 'active';
  const daysLeft = subscription ? getDaysRemaining(subscription.end_date) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-slate-600"/></button>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Receipt size={28} className="text-indigo-600"/> Billing & Subscription</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Subscription Status Card */}
          <div className={`md:col-span-2 rounded-4xl p-8 text-white relative overflow-hidden shadow-xl ${isActive ? 'bg-linear-to-br from-indigo-600 to-purple-700' : 'bg-linear-to-br from-red-500 to-orange-600'}`}>
            <div className="absolute top-0 right-0 p-12 opacity-10"><CreditCard size={180}/></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-indigo-100 font-medium mb-1">Current Plan</p>
                  <h2 className="text-3xl font-black">Termly Access</h2>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 backdrop-blur-md flex items-center gap-2`}>
                  {isActive ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                  {isActive ? 'Active' : 'Expired'}
                </div>
              </div>

              <div className="flex items-end gap-2 mb-8">
                <span className="text-5xl font-black">GH₵ 95</span>
                <span className="text-indigo-200 mb-2 font-bold">/ term</span>
              </div>

              <div className="p-4 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Calendar size={20}/></div>
                  <div>
                    <p className="text-xs text-indigo-200 font-bold uppercase">Days Remaining</p>
                    <p className="text-xl font-black">{daysLeft} Days</p>
                  </div>
                </div>
                {!isActive || daysLeft < 10 ? (
                  <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg">
                    Renew Now
                  </button>
                ) : (
                  <span className="text-xs font-medium text-indigo-200">Auto-renews disabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><History size={24}/></div>
              <p className="text-slate-400 text-xs font-bold uppercase">Total Paid</p>
              <p className="text-2xl font-black text-slate-800">GH₵ {(transactions.length * 95).toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Calendar size={24}/></div>
              <p className="text-slate-400 text-xs font-bold uppercase">Next Due Date</p>
              <p className="text-xl font-black text-slate-800">{subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <h3 className="text-xl font-bold text-slate-800 mb-6">Payment History</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {transactions.length === 0 ? (
             <div className="p-10 text-center text-slate-400">No transactions found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">Term 3 Subscription</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">GH₵ {tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle size={12}/> Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, Calendar, CheckCircle, 
  Flame, BookOpen, ShoppingBag, Trophy, Loader2, Clock 
} from 'lucide-react';

export default function ActivityLog() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    // Fetch activities (assuming an 'activities' table exists)
    // If not, you can create one or mock this data for now
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setActivities(data || []);
    setLoading(false);
  };

  // Helper to format date groups
  const getGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  // Helper to get Icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'daily_challenge': return <Flame size={18} className="text-orange-500" />;
      case 'quiz_completion': return <Trophy size={18} className="text-yellow-500" />;
      case 'lesson_read': return <BookOpen size={18} className="text-blue-500" />;
      case 'shop_purchase': return <ShoppingBag size={18} className="text-purple-500" />;
      default: return <CheckCircle size={18} className="text-slate-400" />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition"><ArrowLeft size={20} className="text-slate-600"/></button>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Clock size={28} className="text-indigo-600"/> Activity History
          </h1>
        </div>

        {/* Timeline Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {activities.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={32}/></div>
              <p>No activity recorded yet. Start learning!</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {activities.map((item, index) => (
                <div key={item.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full"></div>
                  
                  {/* Date Header (Only show if different from prev) */}
                  {(index === 0 || getGroupDate(item.created_at) !== getGroupDate(activities[index - 1].created_at)) && (
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      {getGroupDate(item.created_at)}
                    </h3>
                  )}

                  {/* Activity Card */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        {getActivityIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.description}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {item.xp_earned > 0 && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">+{item.xp_earned} XP</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowRight, TrendingUp, Users, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myOpen: 0,
    teamUnread: 0,
    todayResolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { count: myOpen } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user?.id)
          .eq('status', 'open');

        const { count: teamUnread } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .gt('unread_count', 0);

        const today = new Date();
        today.setHours(0,0,0,0);
        const { count: todayResolved } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')
          .gte('updated_at', today.toISOString());

        setStats({
          myOpen: myOpen || 0,
          teamUnread: teamUnread || 0,
          todayResolved: todayResolved || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-slate-500 mt-2 text-lg">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/app/inbox')}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-indigo-100 group-hover:text-indigo-500 transition-colors">
              <MessageSquare size={80} />
            </div>
            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">My Open Chats</h3>
            <p className="text-5xl font-black text-slate-900 mb-6">{stats.myOpen}</p>
            <div className="flex items-center text-indigo-600 font-bold text-sm">
              <span>Go to Inbox</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Team Unread</h3>
            <p className="text-5xl font-black text-slate-900 mb-6">{stats.teamUnread}</p>
            <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit text-xs font-bold border border-orange-100">
              <AlertCircle size={12} className="mr-1.5" />
              <span>Immediate Attention Required</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Resolved Today</h3>
            <p className="text-5xl font-black text-slate-900 mb-6">{stats.todayResolved}</p>
            <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit text-xs font-bold border border-emerald-100">
              <TrendingUp size={12} className="mr-1.5" />
              <span>+12% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
              <Zap size={24} className="text-indigo-600" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard 
                icon={<Users />} 
                title="Customer Directory" 
                desc="Manage your WhatsApp leads"
                onClick={() => navigate('/app/contacts')}
              />
              <QuickActionCard 
                icon={<Zap />} 
                title="Response Library" 
                desc="Edit your canned replies"
                onClick={() => navigate('/app/replies')}
              />
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Team Collaboration</h2>
              <p className="text-indigo-200 mb-8 max-w-xs">You're currently working with {stats.todayResolved > 0 ? '5' : '0'} other agents online.</p>
              <button 
                onClick={() => navigate('/app/agents')}
                className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <span>View Team Directory</span>
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] opacity-10">
              <Users size={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-5 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-lg transition-all text-left group"
    >
      <div className="text-indigo-600 mb-4 bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </button>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Mail, Loader2, MoreVertical, UserPlus } from 'lucide-react';
import { showError } from '@/utils/toast';

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, updated_at')
          .order('first_name', { ascending: true });

        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error(err);
        showError('Failed to load agents directory');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Directory</h1>
            <p className="text-slate-500 mt-1">Manage your support agents and roles</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center space-x-2 font-medium transition-colors">
            <UserPlus size={18} />
            <span>Invite Agent</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
              <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                <MoreVertical size={18} />
              </button>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border-2 border-white shadow-md flex items-center justify-center text-indigo-700 text-xl font-bold uppercase">
                  {agent.first_name ? agent.first_name.charAt(0) : 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {agent.first_name} {agent.last_name || ''}
                  </h3>
                  <div className="flex items-center space-x-1 mt-0.5">
                    {agent.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        <Shield size={10} />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Agent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-500">
                  <Mail size={16} className="mr-3 text-slate-400" />
                  <span className="truncate">Contact via system</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
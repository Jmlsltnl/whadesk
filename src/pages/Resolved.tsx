import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, RefreshCw, Loader2, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export default function Resolved() {
  const [resolvedChats, setResolvedChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResolvedChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, updated_at,
          contacts (id, name, phone_number),
          profiles (id, first_name, last_name)
        `)
        .eq('status', 'resolved')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResolvedChats(data || []);
    } catch (error: any) {
      console.error('Error fetching resolved chats:', error);
      showError('Failed to load resolved history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolvedChats();
  }, []);

  const handleReopen = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'open' })
        .eq('id', chatId);
      
      if (error) throw error;
      showSuccess('Chat reopened successfully!');
      
      // Remove from list
      setResolvedChats(prev => prev.filter(c => c.id !== chatId));
    } catch (err: any) {
      showError('Failed to reopen chat');
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString([], { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Filter based on search query
  const filteredChats = resolvedChats.filter(chat => {
    const term = searchQuery.toLowerCase();
    const nameMatch = chat.contacts?.name?.toLowerCase().includes(term);
    const phoneMatch = chat.contacts?.phone_number?.toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resolved Conversations</h1>
            <p className="text-slate-500 mt-1">History of closed tickets and finished chats</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
            />
          </div>
        </div>

        {resolvedChats.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No resolved chats</h3>
            <p className="text-slate-500">When you resolve conversations in your inbox, they will appear here.</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm text-slate-500">
            No history found matching "{searchQuery}"
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Agent</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved On</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {(chat.contacts?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{chat.contacts?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{chat.contacts?.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {chat.profiles ? `${chat.profiles.first_name} ${chat.profiles.last_name || ''}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {formatDate(chat.updated_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleReopen(chat.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        <RefreshCw size={14} />
                        <span>Reopen</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
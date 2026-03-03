import React, { useState, useEffect } from 'react';
import { Search, Clock, RefreshCw, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export default function Snoozed() {
  const [snoozedChats, setSnoozedChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSnoozedChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, updated_at,
          contacts (id, name, phone_number),
          profiles (id, first_name, last_name)
        `)
        .eq('status', 'snoozed')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSnoozedChats(data || []);
    } catch (error: any) {
      console.error('Error fetching snoozed chats:', error);
      showError('Failed to load snoozed history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnoozedChats();
  }, []);

  const handleUnarchive = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'open' })
        .eq('id', chatId);
      
      if (error) throw error;
      showSuccess('Chat moved back to inbox');
      setSnoozedChats(prev => prev.filter(c => c.id !== chatId));
    } catch (err: any) {
      showError('Failed to reopen chat');
    }
  };

  const filteredChats = snoozedChats.filter(chat => {
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Snoozed</h1>
            <p className="text-slate-500 mt-1">Conversations waiting for follow-up</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search snoozed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
            />
          </div>
        </div>

        {snoozedChats.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No snoozed chats</h3>
            <p className="text-slate-500">Your follow-up list is empty. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{chat.contacts?.name || 'Unknown'}</h3>
                    <p className="text-xs text-slate-500">{chat.contacts?.phone_number} • Assigned to {chat.profiles?.first_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnarchive(chat.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-semibold text-sm"
                >
                  <RefreshCw size={16} />
                  <span>Move to Inbox</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
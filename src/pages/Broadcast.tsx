import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, Users, Send, CheckCircle2, AlertCircle, Loader2, Search, X } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/components/AuthProvider';

export default function Broadcast() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from('contacts').select('*').eq('is_blocked', false);
      if (data) setContacts(data);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const handleSendBroadcast = async () => {
    if (!message.trim() || selectedIds.length === 0 || !user) return;

    setSending(true);
    try {
      // Find or create chats for these contacts
      for (const contactId of selectedIds) {
        // Find existing chat
        const { data: existingChat } = await supabase
          .from('chats')
          .select('id')
          .eq('contact_id', contactId)
          .single();

        let chatId = existingChat?.id;

        if (!chatId) {
          const { data: newChat } = await supabase
            .from('chats')
            .insert({ contact_id: contactId, assigned_to: user.id })
            .select()
            .single();
          chatId = newChat.id;
        }

        // Send message
        await supabase.from('messages').insert({
          chat_id: chatId,
          content: message,
          sender_type: 'agent',
          sender_id: user.id
        });

        // Update chat timestamp
        await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
      }

      showSuccess(`Broadcast sent to ${selectedIds.length} recipients!`);
      setMessage('');
      setSelectedIds([]);
    } catch (err) {
      showError('Failed to complete broadcast');
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone_number.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-lg shadow-indigo-100">
                <Megaphone size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campaign Engine</h1>
                <p className="text-slate-500">Blast messages to multiple customers at once</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Campaign Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message here..."
                className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-lg transition-all resize-none"
              />
              <div className="flex items-center space-x-2 text-xs text-slate-400 px-4">
                <AlertCircle size={14} />
                <span>Bulk messages should follow WhatsApp business policies to avoid blocking.</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="text-slate-500 font-medium">
                Recipients Selected: <span className="text-indigo-600 font-bold">{selectedIds.length}</span>
              </div>
              <button 
                onClick={handleSendBroadcast}
                disabled={sending || selectedIds.length === 0 || !message.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span>Launch Broadcast</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <h2 className="text-xl font-bold text-slate-800 mb-4 px-2 flex items-center justify-between">
              <span>Recipients</span>
              <button 
                onClick={selectAll}
                className="text-xs text-indigo-600 hover:underline"
              >
                {selectedIds.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filter contacts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center space-x-3 ${
                    selectedIds.includes(contact.id) 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    selectedIds.includes(contact.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'
                  }`}>
                    {selectedIds.includes(contact.id) && <CheckCircle2 size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{contact.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{contact.phone_number}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
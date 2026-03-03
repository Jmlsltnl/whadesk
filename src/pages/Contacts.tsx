import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Ban, MessageSquare, Loader2, MoreVertical, ShieldCheck, ShieldAlert, Edit2, Check, X } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const toggleBlock = async (contact: any) => {
    const newState = !contact.is_blocked;
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: newState })
        .eq('id', contact.id);
      
      if (error) throw error;
      showSuccess(newState ? 'Customer blocked' : 'Customer unblocked');
      fetchContacts();
    } catch (err) {
      showError('Update failed');
    }
  };

  const handleUpdateName = async (id: string) => {
    if (!editName.trim()) return setEditingId(null);
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ name: editName })
        .eq('id', id);
      
      if (error) throw error;
      showSuccess('Contact updated');
      setEditingId(null);
      fetchContacts();
    } catch (err) {
      showError('Update failed');
    }
  };

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone_number.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Customer CRM</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Directory of all users who contacted you via WhatsApp</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Phone</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Added</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase">
                        {(contact.name || '?').charAt(0)}
                      </div>
                      <div>
                        {editingId === contact.id ? (
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 text-sm border border-indigo-300 rounded-md focus:outline-none dark:bg-slate-800 dark:text-white"
                              autoFocus
                            />
                            <button onClick={() => handleUpdateName(contact.id)} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-500"><X size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-slate-800 dark:text-white">{contact.name || 'Unknown'}</p>
                            <button 
                              onClick={() => { setEditingId(contact.id); setEditName(contact.name || ''); }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-all"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-400">WhatsApp User</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono text-slate-500 dark:text-slate-400">
                    {contact.phone_number}
                  </td>
                  <td className="px-8 py-5">
                    {contact.is_blocked ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                        <ShieldAlert size={12} />
                        <span>Blocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        <ShieldCheck size={12} />
                        <span>Active</span>
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => navigate('/app/inbox')}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        title="View Conversation"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button 
                        onClick={() => toggleBlock(contact)}
                        className={`p-2.5 rounded-xl transition-all ${contact.is_blocked ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                        title={contact.is_blocked ? 'Unblock' : 'Block'}
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredContacts.length === 0 && (
            <div className="p-20 text-center">
              <Users size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No customers found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
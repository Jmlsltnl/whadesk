import React, { useState } from 'react';
import { Search as SearchIcon, MessageSquare, User, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.length < 3) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, sender_type,
          chats (
            id,
            contacts (name, phone_number)
          )
        `)
        .ilike('content', `%${query}%`)
        .neq('sender_type', 'note')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      showError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Search</h1>
          <p className="text-slate-500 mt-1">Search through every message sent or received across all time</p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 3 characters to search messages..." 
            className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-xl shadow-indigo-100/50 transition-all text-lg"
          />
          <button 
            type="submit"
            disabled={loading || query.length < 3}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-indigo-400 mx-auto" size={40} />
              <p className="text-slate-400 mt-4 font-medium">Scanning archives...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => navigate('/app/inbox')}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${msg.sender_type === 'agent' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <User size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {msg.chats?.contacts?.name || msg.chats?.contacts?.phone_number}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {msg.sender_type === 'agent' ? 'Sent by Team' : 'Received from Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-slate-400 text-xs">
                    <Calendar size={14} className="mr-1" />
                    {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-slate-600 bg-slate-50/50 p-4 rounded-2xl text-sm italic border border-slate-50 group-hover:bg-white transition-colors">
                  "...{msg.content}..."
                </p>
                <div className="mt-4 flex justify-end items-center text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View in Conversation</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            ))
          ) : hasSearched && (
            <div className="py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
              <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
              <p className="text-slate-500 mt-2">Try different keywords or check the spelling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
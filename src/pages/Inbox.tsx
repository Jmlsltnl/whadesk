import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, Ban, CheckCircle, Clock, UserCheck, MessageSquarePlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { showSuccess, showError } from '@/utils/toast';

export default function Inbox() {
  const { user } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, status, unread_count, updated_at,
          contacts (id, name, phone_number, is_blocked),
          profiles (id, first_name, last_name)
        `)
        .neq('status', 'resolved')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
      
      if (data && data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      } else if (data && data.length === 0) {
        setActiveChat(null);
      }
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      showError('Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.unread_count > 0) {
      try {
        await supabase.from('chats').update({ unread_count: 0 }).eq('id', chatId);
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c));
      } catch (err) {
        console.error('Failed to clear unread count', err);
      }
    }
  };

  useEffect(() => {
    fetchChats();

    const channel = supabase.channel('public-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        if (activeChat) fetchMessages(activeChat.id);
        fetchChats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      markAsRead(activeChat.id);
    }
  }, [activeChat?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: activeChat.id,
        content: messageText,
        sender_type: 'agent',
        sender_id: user.id
      });

      if (error) throw error;
      
      await supabase.from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeChat.id);

      fetchMessages(activeChat.id);
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const updateChatStatus = async (status: string) => {
    if (!activeChat) return;
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status })
        .eq('id', activeChat.id);
      
      if (error) throw error;
      showSuccess(`Chat marked as ${status}`);
      
      if (status === 'resolved') {
        setActiveChat(null);
      } else {
        setActiveChat({ ...activeChat, status });
      }
      
      fetchChats();
    } catch (err: any) {
      showError('Failed to update chat status');
    }
  };

  const toggleBlockStatus = async () => {
    if (!activeChat) return;
    const newBlockedState = !activeChat.contacts.is_blocked;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: newBlockedState })
        .eq('id', activeChat.contacts.id);
        
      if (error) throw error;
      showSuccess(newBlockedState ? 'Contact blocked' : 'Contact unblocked');
      
      const updatedChat = {
        ...activeChat,
        contacts: { ...activeChat.contacts, is_blocked: newBlockedState }
      };
      
      setActiveChat(updatedChat);
      setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
    } catch (err) {
      showError('Failed to update contact status');
    }
  };

  const seedDemoData = async () => {
    if (!user) return showError("Must be logged in");
    try {
      showSuccess("Generating demo data...");
      
      const { data: contact, error: contactErr } = await supabase.from('contacts')
        .insert({ phone_number: '+1 555 ' + Math.floor(Math.random() * 10000), name: 'Demo Customer ' + Math.floor(Math.random() * 100) })
        .select().single();
      if (contactErr) throw contactErr;

      const { data: chat, error: chatErr } = await supabase.from('chats')
        .insert({ contact_id: contact.id, assigned_to: user.id, unread_count: 1 })
        .select().single();
      if (chatErr) throw chatErr;

      await supabase.from('messages').insert([
        { chat_id: chat.id, content: 'Hello, I have a question about my account.', sender_type: 'customer' }
      ]);

      showSuccess("Demo data injected!");
      fetchChats();
    } catch (error: any) {
      console.error(error);
      showError("Failed to seed data.");
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(chat => {
    const term = searchQuery.toLowerCase();
    const nameMatch = chat.contacts?.name?.toLowerCase().includes(term);
    const phoneMatch = chat.contacts?.phone_number?.toLowerCase().includes(term);
    return nameMatch || phoneMatch;
  });

  if (loadingChats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-l-3xl shadow-sm border-y border-l border-slate-200 my-2">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-l-3xl shadow-sm border-y border-l border-slate-200 my-2 p-8 text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
          <MessageSquarePlus size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No active chats</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          You're all caught up! When new messages arrive, they will appear here.
        </p>
        <button 
          onClick={seedDemoData}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center space-x-2"
        >
          <MessageSquarePlus size={20} />
          <span>Generate Demo Chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white rounded-l-3xl shadow-sm overflow-hidden border-y border-l border-slate-200 my-2">
      
      {/* COLUMN 1: Chat List */}
      <div className="w-80 flex flex-col border-r border-slate-100 bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Inbox</h2>
          <button onClick={seedDemoData} className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100">
            + Demo
          </button>
        </div>
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No chats found for "{searchQuery}"</div>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-3 rounded-2xl cursor-pointer transition-all ${
                  activeChat?.id === chat.id 
                    ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                    : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold text-sm ${activeChat?.id === chat.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {chat.contacts?.name || chat.contacts?.phone_number}
                  </h3>
                  <span className="text-xs text-slate-400">{formatTime(chat.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    chat.status === 'open' ? 'text-green-600 bg-green-100' : 
                    chat.status === 'resolved' ? 'text-slate-400 bg-slate-100' : 'text-orange-600 bg-orange-100'
                  }`}>
                    {chat.status}
                  </span>
                  {chat.unread_count > 0 && (
                    <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMN 2: Chat Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white shadow-sm z-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                {(activeChat.contacts?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{activeChat.contacts?.name || 'Unknown Contact'}</h2>
                <p className="text-xs text-slate-500">{activeChat.contacts?.phone_number}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400 text-sm">
                No messages yet. Send one below!
              </div>
            ) : (
              messages.map(msg => {
                const isAgent = msg.sender_type === 'agent';
                return (
                  <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                      isAgent 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[10px] mt-1 text-right ${isAgent ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 z-10">
            {activeChat.contacts?.is_blocked ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center justify-between space-x-2 border border-red-100">
                <div className="flex items-center space-x-2">
                  <Ban size={18} />
                  <span className="font-medium">You have blocked this contact.</span>
                </div>
                <button 
                  onClick={toggleBlockStatus}
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-bold shadow-sm transition-colors"
                >
                  Unblock
                </button>
              </div>
            ) : (
              <div className="flex items-end space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
                <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message... (Press Enter to send)" 
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 focus:outline-none text-sm text-slate-800"
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
          Select a chat to start messaging
        </div>
      )}

      {/* COLUMN 3: Contact Info & Actions */}
      {activeChat && (
        <div className="w-72 bg-slate-50/50 border-l border-slate-100 flex flex-col z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
              {(activeChat.contacts?.name || '?').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{activeChat.contacts?.name || 'Unknown'}</h2>
            <p className="text-slate-500 text-sm mb-4">{activeChat.contacts?.phone_number}</p>
            
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-green-200">
                <CheckCircle size={14} />
                <span>WhatsApp Active</span>
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Status Controls */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Conversation Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateChatStatus('resolved')}
                  className="flex flex-col items-center justify-center py-3 border rounded-xl transition-colors shadow-sm bg-white border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-600"
                >
                  <CheckCircle size={20} className="mb-1" />
                  <span className="text-xs font-semibold">Resolve</span>
                </button>
                <button 
                  onClick={() => updateChatStatus('snoozed')}
                  disabled={activeChat.status === 'snoozed'}
                  className={`flex flex-col items-center justify-center py-3 border rounded-xl transition-colors shadow-sm ${
                    activeChat.status === 'snoozed' 
                      ? 'bg-orange-50 border-orange-200 text-orange-600' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600'
                  }`}
                >
                  <Clock size={20} className="mb-1" />
                  <span className="text-xs font-semibold">Snooze</span>
                </button>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assignment</h3>
              <button className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 transition-colors shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                    {activeChat.profiles?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">
                      {activeChat.profiles ? `${activeChat.profiles.first_name} ${activeChat.profiles.last_name || ''}` : 'Unassigned'}
                    </p>
                    <p className="text-[10px] text-slate-500">Currently Assigned</p>
                  </div>
                </div>
                <UserCheck size={16} className="text-slate-400" />
              </button>
            </div>
            
            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-200">
              <button 
                onClick={toggleBlockStatus}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl transition-colors text-sm font-bold ${
                  activeChat.contacts?.is_blocked
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                }`}
              >
                <Ban size={16} />
                <span>{activeChat.contacts?.is_blocked ? 'Unblock Contact' : 'Block Contact'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
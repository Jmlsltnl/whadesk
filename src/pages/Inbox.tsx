import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Ban, CheckCircle, Clock, UserCheck, AlertCircle } from 'lucide-react';

// Mock Data
const MOCK_CHATS = [
  { id: 1, name: 'Alice Johnson', number: '+1 234 567 8900', lastMessage: 'Thanks for the help!', time: '10:42 AM', unread: 0, status: 'open', assigned: 'Agent Sarah' },
  { id: 2, name: 'Tech Solutions Inc', number: '+44 7700 900077', lastMessage: 'When will the delivery arrive?', time: '09:15 AM', unread: 2, status: 'open', assigned: 'Unassigned' },
  { id: 3, name: 'Carlos Rodriguez', number: '+34 600 123 456', lastMessage: 'I need to update my billing.', time: 'Yesterday', unread: 1, status: 'open', assigned: 'Agent Sarah' },
  { id: 4, name: 'Emma Wilson', number: '+1 555 019 8372', lastMessage: 'Perfect, that works for me.', time: 'Yesterday', unread: 0, status: 'resolved', assigned: 'Agent Mike' },
];

const MOCK_MESSAGES = [
  { id: 1, text: 'Hello, I have a question about my recent order.', sender: 'customer', time: '10:30 AM' },
  { id: 2, text: 'Hi Alice! I\'d be happy to help. Can you provide your order number?', sender: 'agent', time: '10:32 AM' },
  { id: 3, text: 'Sure, it is ORD-99281.', sender: 'customer', time: '10:35 AM' },
  { id: 4, text: 'Thanks! I see it here. Your package is currently out for delivery and should arrive by 8 PM today.', sender: 'agent', time: '10:38 AM' },
  { id: 5, text: 'Thanks for the help!', sender: 'customer', time: '10:42 AM' },
];

const Inbox = () => {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);
  const [message, setMessage] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  return (
    <div className="flex h-full w-full bg-white rounded-l-3xl shadow-sm overflow-hidden border-y border-l border-slate-200 my-2">
      
      {/* COLUMN 1: Chat List */}
      <div className="w-80 flex flex-col border-r border-slate-100 bg-slate-50/50">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Open Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages or numbers..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-3 rounded-2xl cursor-pointer transition-all ${
                activeChat.id === chat.id 
                  ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                  : 'hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold text-sm ${activeChat.id === chat.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {chat.name}
                </h3>
                <span className="text-xs text-slate-400">{chat.time}</span>
              </div>
              <p className="text-sm text-slate-500 truncate mb-2">{chat.lastMessage}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {chat.assigned}
                </span>
                {chat.unread > 0 && (
                  <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 2: Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
              {activeChat.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{activeChat.name}</h2>
              <p className="text-xs text-slate-500">{activeChat.number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
          </div>
          
          {MOCK_MESSAGES.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.sender === 'agent' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[10px] mt-1 text-right ${msg.sender === 'agent' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          {isBlocked ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center justify-center space-x-2 border border-red-100">
              <Ban size={18} />
              <span className="font-medium">You have blocked this contact. Unblock to send messages.</span>
            </div>
          ) : (
            <div className="flex items-end space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <Paperclip size={20} />
              </button>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 focus:outline-none text-sm text-slate-800"
                rows={1}
              />
              <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: Contact Info & Actions */}
      <div className="w-72 bg-slate-50/50 border-l border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
            {activeChat.name.charAt(0)}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{activeChat.name}</h2>
          <p className="text-slate-500 text-sm mb-4">{activeChat.number}</p>
          
          <div className="flex flex-wrap justify-center gap-2 w-full">
            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle size={14} />
              <span>WhatsApp Verified</span>
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Status Controls */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Conversation Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors text-slate-600 shadow-sm">
                <CheckCircle size={20} className="mb-1" />
                <span className="text-xs font-semibold">Resolve</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors text-slate-600 shadow-sm">
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
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  S
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">Agent Sarah</p>
                  <p className="text-[10px] text-slate-500">Currently Assigned</p>
                </div>
              </div>
              <UserCheck size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Danger Zone</h3>
            <button 
              onClick={() => setIsBlocked(!isBlocked)}
              className={`w-full flex items-center space-x-2 p-3 rounded-xl transition-colors font-medium text-sm border shadow-sm ${
                isBlocked 
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' 
                  : 'bg-white text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <Ban size={16} />
              <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
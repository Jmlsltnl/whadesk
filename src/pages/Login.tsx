import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate('/app/inbox');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-6">
            <MessageSquare size={40} strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">WhaDesk</h1>
          <p className="text-slate-500 mt-2 font-medium">Shared WhatsApp Inbox for Teams</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 p-8 border border-indigo-50">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Agent Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="agent@company.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 mt-4 disabled:opacity-70"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-500 text-sm">
            <ShieldCheck size={16} />
            <span>Secure Admin-provisioned access only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
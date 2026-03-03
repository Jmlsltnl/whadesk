import React, { useState } from 'react';
import { MessageSquare, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { session } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/app/inbox" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Handle Registration
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: email.split('@')[0], // Generate a default first name
            }
          }
        });
        if (error) throw error;
        showSuccess('Account created! You are now signed in.');
      } else {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showSuccess('Signed in successfully');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {isSignUp ? 'Create Agent Account' : 'Agent Login'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-5">
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
                {!isSignUp && (
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot?</a>
                )}
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 mt-4 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

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
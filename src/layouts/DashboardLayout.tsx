import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, BarChart2, Users, Settings, LogOut, CheckCircle2, Lock, Clock, Zap, UserSquare2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/use-profile';

const DashboardLayout = () => {
  const { signOut } = useAuth();
  const { profile, isAdmin, loading } = useProfile();

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : (profile?.id ? "Agent" : "Loading...");
    
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-indigo-900 text-indigo-50 flex flex-col justify-between rounded-r-3xl my-2 ml-2 shadow-xl border border-indigo-800 relative z-20">
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 flex items-center space-x-3 mb-6">
            <div className="bg-white text-indigo-900 p-2 rounded-xl shadow-lg">
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">WhaDesk</h1>
          </div>

          <nav className="px-4 space-y-1">
            <p className="px-4 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Workspace</p>
            <NavLink
              to="/app/inbox"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <MessageSquare size={18} />
              <span className="font-medium text-sm">Inbox</span>
            </NavLink>

            <NavLink
              to="/app/snoozed"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <Clock size={18} />
              <span className="font-medium text-sm">Snoozed</span>
            </NavLink>

            <NavLink
              to="/app/resolved"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <CheckCircle2 size={18} />
              <span className="font-medium text-sm">Resolved</span>
            </NavLink>

            <p className="px-4 py-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Management</p>
            
            <NavLink
              to="/app/contacts"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <UserSquare2 size={18} />
              <span className="font-medium text-sm">Customers</span>
            </NavLink>

            <NavLink
              to="/app/replies"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <Zap size={18} />
              <span className="font-medium text-sm">Library</span>
            </NavLink>

            <NavLink
              to="/app/agents"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <Users size={18} />
              <span className="font-medium text-sm">Team</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/app/stats"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                  }`
                }
              >
                <BarChart2 size={18} />
                <span className="font-medium text-sm">Analytics</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="p-4 space-y-2 mb-2">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex w-full items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
              }`
            }
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Settings</span>
          </NavLink>
          
          <div className="bg-indigo-800/50 rounded-2xl p-4 flex flex-col mt-4 border border-indigo-700">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-inner uppercase">
                {initial}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate capitalize">{displayName}</p>
                {isAdmin && (
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Admin</span>
                )}
              </div>
              <button onClick={handleLogout} className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-700 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
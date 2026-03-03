import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MessageSquare, BarChart2, Users, Settings, LogOut, CheckCircle2 } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-indigo-50 flex flex-col justify-between rounded-r-3xl my-2 ml-2 shadow-xl border border-indigo-800 relative z-20">
        <div>
          <div className="p-6 flex items-center space-x-3 mb-6">
            <div className="bg-white text-indigo-900 p-2 rounded-xl">
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">WhaDesk</h1>
          </div>

          <nav className="px-4 space-y-2">
            <NavLink
              to="/app/inbox"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <MessageSquare size={20} />
              <span className="font-medium">Inbox</span>
              <span className="ml-auto bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                5
              </span>
            </NavLink>

            <NavLink
              to="/app/resolved"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <CheckCircle2 size={20} />
              <span className="font-medium">Resolved</span>
            </NavLink>

            <NavLink
              to="/app/stats"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <BarChart2 size={20} />
              <span className="font-medium">Statistics</span>
            </NavLink>

            <NavLink
              to="/app/agents"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                }`
              }
            >
              <Users size={20} />
              <span className="font-medium">Agents</span>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 space-y-2 mb-2">
          <button className="flex w-full items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:bg-indigo-800 text-indigo-200 hover:text-white">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          
          <div className="bg-indigo-800/50 rounded-2xl p-4 flex items-center space-x-3 mt-4 border border-indigo-700">
            <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Agent Sarah</p>
              <p className="text-xs text-indigo-300 truncate">sarah@whadesk.com</p>
            </div>
            <button onClick={handleLogout} className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-700 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const data = [
  { name: 'Mon', messages: 400, resolved: 240 },
  { name: 'Tue', messages: 300, resolved: 139 },
  { name: 'Wed', messages: 200, resolved: 980 },
  { name: 'Thu', messages: 278, resolved: 390 },
  { name: 'Fri', messages: 189, resolved: 480 },
  { name: 'Sat', messages: 239, resolved: 380 },
  { name: 'Sun', messages: 349, resolved: 430 },
];

const agentData = [
  { name: 'Sarah', chats: 145 },
  { name: 'Mike', chats: 98 },
  { name: 'Alex', chats: 112 },
  { name: 'Emma', chats: 86 },
];

const Stats = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Overview</h1>
            <p className="text-slate-500 mt-1">Track agent efficiency and message volumes</p>
          </div>
          <div className="bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm font-medium text-sm text-slate-600">
            Last 7 Days
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<MessageSquare />} title="Total Messages" value="12,403" trend="+14%" positive />
          <StatCard icon={<CheckCircle />} title="Resolved Chats" value="1,284" trend="+8%" positive />
          <StatCard icon={<Clock />} title="Avg Response Time" value="4m 32s" trend="-12%" positive />
          <StatCard icon={<Users />} title="Active Agents" value="12" trend="0%" neutral />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Message Volume vs Resolution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="messages" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMessages)" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Chats per Agent</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600}} width={60} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="chats" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, positive, neutral }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
        {React.cloneElement(icon, { size: 24, strokeWidth: 2 })}
      </div>
      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
        neutral ? 'bg-slate-100 text-slate-600' :
        positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {trend}
      </span>
    </div>
    <div>
      <h4 className="text-slate-500 font-medium mb-1">{title}</h4>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Stats;
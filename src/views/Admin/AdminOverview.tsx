import React from 'react';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, 
  ArrowUpRight, ArrowDownRight, Package, Star 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, 
  PieChart, Pie, Cell 
} from 'recharts';

interface AdminOverviewProps {
  stats: any[];
  revenueData: any[];
  categoryData: any[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, revenueData, categoryData }) => {
  const COLORS = ['#1a1a1a', '#4a4a4a', '#8a8a8a', '#c0c0c0'];

  return (
    <div className="space-y-10 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-serif font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <div><h3 className="text-2xl font-serif font-bold text-gray-900">Revenus & Ventes</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Performance mensuelle</p></div>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20">
              <option>Derniers 7 jours</option>
              <option>Derniers 30 jours</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1}/><stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}} />
                <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="sales" stroke="#9ca3af" strokeWidth={3} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-10">Ventes par Catégorie</h3>
          <div className="h-[300px] mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                  {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

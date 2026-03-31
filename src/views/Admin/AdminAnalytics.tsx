import React from 'react';
import { Eye, MousePointer2, TrendingUp } from 'lucide-react';
import { PRODUCTS, SALES_DATA } from '../../constants';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
            <Eye className="text-blue-500" size={24} /> Produits les plus consultés
          </h3>
          <div className="space-y-4">
            {PRODUCTS.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <span className="text-lg font-serif font-bold text-slate-300">0{i+1}</span>
                <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-grow">
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{p.views?.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Vues</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
            <MousePointer2 className="text-green-500" size={24} /> Produits les plus vendus
          </h3>
          <div className="space-y-4">
            {PRODUCTS.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <span className="text-lg font-serif font-bold text-slate-300">0{i+1}</span>
                <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-grow">
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{p.salesCount?.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ventes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-serif mb-8">Performance des Ventes</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_DATA}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

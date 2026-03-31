import React from 'react';
import { 
  TrendingUp, ShoppingBag, ArrowDownRight, Coins, Plus 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { DataTable } from '../../components/DataTable';
import { Expense, Order, Product } from '../../types';

interface AdminFinancesProps {
  localOrders: Order[];
  localProducts: Product[];
  localExpenses: Expense[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminFinances: React.FC<AdminFinancesProps> = ({
  localOrders,
  localProducts,
  localExpenses,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-10">
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { 
            label: "Chiffre d'Affaires", 
            value: localOrders.reduce((acc, o) => acc + o.total, 0), 
            color: "text-green-600",
            icon: <TrendingUp size={20} />
          },
          { 
            label: "Coût d'Achat (Estimé)", 
            value: localOrders.reduce((acc, o) => {
              return acc + (o.orderDetails?.reduce((sum, item) => {
                const product = localProducts.find(p => p.id === item.productId);
                return sum + ((product?.purchasePrice || 0) * item.quantity);
              }, 0) || 0);
            }, 0), 
            color: "text-blue-600",
            icon: <ShoppingBag size={20} />
          },
          { 
            label: "Dépenses Totales", 
            value: localExpenses.reduce((acc, e) => acc + e.amount, 0), 
            color: "text-red-600",
            icon: <ArrowDownRight size={20} />
          },
          { 
            label: "Bénéfice Net", 
            value: localOrders.reduce((acc, o) => acc + o.total, 0) - 
                   localOrders.reduce((acc, o) => {
                     return acc + (o.orderDetails?.reduce((sum, item) => {
                       const product = localProducts.find(p => p.id === item.productId);
                       return sum + ((product?.purchasePrice || 0) * item.quantity);
                     }, 0) || 0);
                   }, 0) - 
                   localExpenses.reduce((acc, e) => acc + e.amount, 0), 
            color: "text-accent",
            icon: <Coins size={20} />
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-primary">{stat.icon}</div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()} FCFA</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Expenses Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-serif mb-8">Répartition des Dépenses</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Stock', value: localExpenses.filter(e => e.category === 'stock').reduce((acc, e) => acc + e.amount, 0) },
                { name: 'Transport', value: localExpenses.filter(e => e.category === 'transport').reduce((acc, e) => acc + e.amount, 0) },
                { name: 'Marketing', value: localExpenses.filter(e => e.category === 'marketing').reduce((acc, e) => acc + e.amount, 0) },
                { name: 'Autre', value: localExpenses.filter(e => e.category === 'other').reduce((acc, e) => acc + e.amount, 0) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                />
                <Bar dataKey="value" fill="#F27D26" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-serif mb-8">Rentabilité</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Coûts', value: localOrders.reduce((acc, o) => {
                      return acc + (o.orderDetails?.reduce((sum, item) => {
                        const product = localProducts.find(p => p.id === item.productId);
                        return sum + ((product?.purchasePrice || 0) * item.quantity);
                      }, 0) || 0);
                    }, 0) + localExpenses.reduce((acc, e) => acc + e.amount, 0), color: '#ef4444' },
                    { name: 'Bénéfice', value: Math.max(0, localOrders.reduce((acc, o) => acc + o.total, 0) - 
                      localOrders.reduce((acc, o) => {
                        return acc + (o.orderDetails?.reduce((sum, item) => {
                          const product = localProducts.find(p => p.id === item.productId);
                          return sum + ((product?.purchasePrice || 0) * item.quantity);
                        }, 0) || 0);
                      }, 0) - 
                      localExpenses.reduce((acc, e) => acc + e.amount, 0)), color: '#22c55e' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { color: '#ef4444' },
                    { color: '#22c55e' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-600">Coûts</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-600">Bénéfice</span>
              </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif">Journal des Dépenses</h3>
          <button 
            onClick={() => { setModalType('expense'); setIsAddModalOpen(true); }}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
          >
            <Plus size={18} /> Ajouter une dépense
          </button>
        </div>
        <DataTable<Expense>
          data={localExpenses}
          title="Dépenses"
          onRowClick={(expense) => { setEditingItem(expense); setModalType('expense'); setIsAddModalOpen(true); }}
          columns={[
            { header: 'Date', accessor: 'date', className: 'text-slate-400 text-sm' },
            { header: 'Description', accessor: 'description', className: 'font-medium' },
            { 
              header: 'Catégorie', 
              accessor: (e) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  e.category === 'stock' ? 'bg-blue-100 text-blue-600' :
                  e.category === 'transport' ? 'bg-yellow-100 text-yellow-600' :
                  e.category === 'marketing' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {e.category === 'stock' ? 'Achat Stock' :
                   e.category === 'transport' ? 'Transport' :
                   e.category === 'marketing' ? 'Marketing' : 'Autre'}
                </span>
              ),
              exportValue: (e) => e.category
            },
            { 
              header: 'Montant', 
              accessor: (e) => <span className="font-bold text-red-500">-{e.amount.toLocaleString()} FCFA</span>,
              exportValue: (e) => e.amount.toString()
            }
          ]}
        />
      </div>
    </div>
  );
};

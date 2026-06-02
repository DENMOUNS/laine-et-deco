import React from 'react';
import { Plus, Truck, Target, Info, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { ShippingRule } from '../../../../types';
import { toast } from 'sonner';

const RULE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  threshold: { label: 'Seuil', color: 'bg-blue-100 text-blue-700' },
  zone:      { label: 'Zone',  color: 'bg-emerald-100 text-emerald-700' },
  default:   { label: 'Défaut', color: 'bg-gray-100 text-gray-600' },
};

export function AdminShipping({ ctx }: { ctx: any }) {
  const {
    activeTab,
    localShippingRules,
    isLoadingShipping,
    deleteShippingRule,
    updateShippingRule,
    sortByDate,
    formatDate,
    setEditingItem,
    setModalType,
    setIsAddModalOpen,
  } = ctx;

  const handleAdd = () => {
    setEditingItem(null);
    setModalType('shipping');
    setIsAddModalOpen(true);
  };

  const handleEdit = (rule: ShippingRule) => {
    setEditingItem(rule);
    setModalType('shipping');
    setIsAddModalOpen(true);
  };

  const handleDelete = (rule: ShippingRule) => {
    if (!window.confirm(`Supprimer la règle "${rule.name}" ?`)) return;
    deleteShippingRule(rule.id!);
    toast.success('Règle de livraison supprimée');
  };

  if (activeTab !== 'shipping') return null;

  const rules = Array.isArray(localShippingRules) ? localShippingRules : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-serif text-primary">Règles de Livraison</h3>
          <p className="text-sm text-primary/50 mt-1">
            Définissez des règles de prix basées sur des seuils de montant ou des zones géographiques.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouvelle Règle
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Règles actives',
            value: rules.filter(r => r.status === 'active').length,
            icon: Truck,
            color: 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'Règles seuil',
            value: rules.filter(r => r.type === 'threshold').length,
            icon: Target,
            color: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Règles zone',
            value: rules.filter(r => r.type === 'zone').length,
            icon: Info,
            color: 'bg-amber-50 text-amber-700',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-secondary/30 border border-primary/10 rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-primary/50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules table */}
      {isLoadingShipping ? (
        <div className="flex items-center justify-center py-16 text-primary/40 text-sm">
          Chargement des règles…
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary/40">
          <Truck size={40} className="opacity-30" />
          <p className="text-sm font-medium">Aucune règle de livraison configurée.</p>
          <button
            onClick={handleAdd}
            className="text-primary text-sm font-bold underline underline-offset-2"
          >
            Ajouter la première règle
          </button>
        </div>
      ) : (
        <DataTable<ShippingRule>
          dateFilterKey="createdAt"
          data={sortByDate(rules)}
          title="Règles de Livraison"
          onRowClick={handleEdit}
          columns={[
            {
              header: 'Nom',
              accessor: 'name',
              className: 'font-bold text-primary',
            },
            {
              header: 'Type',
              accessor: (rule: ShippingRule) => {
                const t = RULE_TYPE_LABELS[rule.type || 'zone'] || RULE_TYPE_LABELS.zone;
                return (
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.color}`}>
                    {t.label}
                  </span>
                );
              },
            },
            {
              header: 'Condition',
              accessor: (rule: ShippingRule) => {
                if (rule.type === 'threshold') {
                  const match = rule.condition?.match(/\d+/);
                  const threshold = match ? Number(match[0]).toLocaleString('fr-FR') : rule.condition;
                  return (
                    <span className="text-sm text-primary/70">
                      Total &gt; <strong>{threshold} FCFA</strong>
                    </span>
                  );
                }
                return <span className="text-sm text-primary/70">{rule.condition || '—'}</span>;
              },
              exportValue: (rule: ShippingRule) => rule.condition || '',
            },
            {
              header: 'Frais',
              accessor: (rule: ShippingRule) => (
                <span className={`font-bold ${rule.price === 0 ? 'text-emerald-600' : 'text-primary'}`}>
                  {rule.price === 0 ? '🎁 Gratuit' : `${rule.price.toLocaleString('fr-FR')} FCFA`}
                </span>
              ),
              exportValue: (rule: ShippingRule) =>
                rule.price === 0 ? 'Gratuit' : `${rule.price} FCFA`,
            },
            {
              header: 'Statut',
              accessor: (rule: ShippingRule) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
                    updateShippingRule(rule.id!, { status: newStatus, updatedAt: new Date().toISOString() });
                    toast.success(
                      `Règle "${rule.name}" ${newStatus === 'active' ? 'activée' : 'désactivée'}`
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    rule.status === 'active'
                      ? 'bg-primary/10 text-primary hover:bg-red-100 hover:text-red-600'
                      : 'bg-secondary/50 text-primary/40 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {rule.status || 'active'}
                </button>
              ),
            },
            {
              header: 'Actions',
              accessor: (rule: ShippingRule) => (
                <div className="flex gap-3 items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(rule);
                    }}
                    className="text-primary/60 hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rule);
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
            {
              header: 'Créé le',
              accessor: (item: any) =>
                formatDate(item.createdAt || item.date || new Date().toISOString()),
              className: 'text-primary/60 text-sm',
              sortable: true,
            },
          ]}
        />
      )}
    </div>
  );
}

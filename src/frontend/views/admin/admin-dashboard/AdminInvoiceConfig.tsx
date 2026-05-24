import React, { useEffect, useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getSystemConfig, saveSystemConfig } from '../../../services/dashboardApi';

export function AdminInvoiceConfig({ ctx }: { ctx: any }) {
  const { activeTab } = ctx;
  const [config, setConfig] = useState({
    phone: '',
    email: '',
    paymentPhone: '',
    paymentName: '',
    address: '',
    message1: '',
    message2: '',
    footerMessage: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeTab !== 'invoice_config') return;

    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const data = await getSystemConfig('invoice_config', 'global');
        if (!data) throw new Error("Configuration introuvable");
        setConfig({
          phone: data.phone || '',
          email: data.email || '',
          paymentPhone: data.paymentPhone || '',
          paymentName: data.paymentName || '',
          address: data.address || '',
          message1: data.message1 || '',
          message2: data.message2 || '',
          footerMessage: data.footerMessage || '',
        });
      } catch (error: any) {
        const msg = error?.message || String(error);
        if (!msg.includes('introuvable') && !msg.includes('404')) {
          toast.error('Impossible de charger la configuration facture');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchConfig();
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSystemConfig('invoice_config', 'global', config);
      toast.success('Configuration de facture enregistrée');
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (activeTab !== 'invoice_config') return null;
  if (isLoading) return <div className="bg-white p-10 rounded-[2rem] text-primary/50">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><FileText size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Configuration Factures</h2>
            <p className="text-sm text-primary/60">Gérez les informations dynamiques des factures PDF.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all disabled:opacity-60"
        >
          <Save size={20} /> {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-primary">Informations entreprise</h3>
            <Field label="Email" value={config.email} onChange={(email) => setConfig({ ...config, email })} />
            <Field label="Téléphone entête" value={config.phone} onChange={(phone) => setConfig({ ...config, phone })} />
            <Field label="Adresse" value={config.address} onChange={(address) => setConfig({ ...config, address })} />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-primary">Paiement et messages</h3>
            <Field label="Nom paiement Mobile Money" value={config.paymentName} onChange={(paymentName) => setConfig({ ...config, paymentName })} />
            <Field label="Téléphone paiement Mobile Money" value={config.paymentPhone} onChange={(paymentPhone) => setConfig({ ...config, paymentPhone })} />
            <Field label="Message conditions 1" value={config.message1} onChange={(message1) => setConfig({ ...config, message1 })} />
            <Field label="Message conditions 2" value={config.message2} onChange={(message2) => setConfig({ ...config, message2 })} />
            <Field label="Message de remerciement" value={config.footerMessage} onChange={(footerMessage) => setConfig({ ...config, footerMessage })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-primary/60 mb-2 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
      />
    </div>
  );
}

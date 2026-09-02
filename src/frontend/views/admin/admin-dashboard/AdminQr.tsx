import React, { useState, useEffect } from 'react';
import { QrCode, Save, Download } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { getSystemConfig, saveSystemConfig } from '../../../services/dashboardApi';

import { fetchDashboardConfig, saveDashboardConfig } from '../../../services/dashboardApi';
export function AdminQr({ ctx }: { ctx: any }) {
  const { activeTab } = ctx;
  const [config, setConfig] = useState({
    whatsappNumber: '',
    whatsappMessage: '',
    welcomeMessage: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeTab !== 'qr') return;
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        // const data = await getSystemConfig('qr_config', 'global');
        const data = await fetchDashboardConfig('qr_config');
        if (data && Object.keys(data).length > 0) {
          setConfig({
            whatsappNumber: data.whatsappNumber || '',
            whatsappMessage: data.whatsappMessage || '',
            welcomeMessage: data.welcomeMessage || '',
          });
        }
      } catch (error: any) {
        const msg = error?.message || String(error);
        if (!msg.includes('introuvable') && !msg.includes('404')) {
          toast.error('Impossible de charger la configuration QR');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSystemConfig('qr_config', 'global', config);
      toast.success('Configuration QR enregistrée');
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg') as unknown as SVGSVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const canvasCtx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvasCtx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'QR-Laine-Deco.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (activeTab !== 'qr') return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl">
            <QrCode size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Configuration QR Code Landing</h2>
            <p className="text-sm text-primary/60">Gérez le contenu de la page de destination du QR code</p>
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

      {isLoading ? (
        <div className="bg-white p-10 rounded-[2rem] flex items-center justify-center text-primary/40">
          Chargement...
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-primary">Paramètres de la page</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
                    Numéro WhatsApp (Format: +237...)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
                    Message pré-rempli WhatsApp
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={config.whatsappMessage}
                    onChange={(e) => setConfig({ ...config, whatsappMessage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
                    Message d'accueil sur la page
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="bg-secondary/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
              <h3 className="font-bold text-lg text-primary">Aperçu du QR Code</h3>
              <p className="text-sm text-primary/60">
                Scannez ce code pour tester la page. Téléchargez-le pour l'imprimer sur vos flyers ou packagings.
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`${window.location.origin}/?view=qr-landing`}
                  size={200}
                  fgColor="#2c3e35"
                />
              </div>
              <div className="text-xs text-primary/40 font-mono bg-white/80 px-4 py-2 rounded-xl break-all">
                {window.location.origin}/?view=qr-landing
              </div>
              <button
                onClick={handleDownload}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all"
              >
                <Download size={18} /> Télécharger QR (PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

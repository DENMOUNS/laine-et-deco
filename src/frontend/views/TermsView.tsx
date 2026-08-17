import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  ShoppingBag,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Search,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Printer,
  Sparkles,
  BookOpen,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
  Copy,
  Check,
  Send,
  Download,
  FileText,
  MapPin,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface TermsViewProps {
  onNavigate?: (view: string) => void;
  initialTab?: 'cgv' | 'cgu' | 'shipping' | 'returns' | 'form' | 'faq' | 'law';
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigate, initialTab = 'cgv' }) => {
  const [activeTab, setActiveTab] = useState<'cgv' | 'cgu' | 'shipping' | 'returns' | 'form' | 'faq' | 'law'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedForm, setCopiedForm] = useState(false);

  // Interactive Return Eligibility Simulator State
  const [simItemType, setSimItemType] = useState<'yarn_intact' | 'yarn_opened' | 'custom_item' | 'accessory_sealed' | 'accessory_opened'>('yarn_intact');
  const [simDaysSinceDelivery, setSimDaysSinceDelivery] = useState<number>(3);

  // Interactive Withdrawal Form State
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formArticles, setFormArticles] = useState('');
  const [formRefundMethod, setFormRefundMethod] = useState<'momo' | 'om' | 'credit'>('momo');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');

  // Expandable FAQ State
  const [expandedFaq, setExpandedFaq] = useState<{ [key: string]: boolean }>({
    'faq-1': true,
    'faq-2': false,
    'faq-3': false,
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Eligibility Simulator Result Calculation
  const simulationResult = useMemo(() => {
    const isWithin7Days = simDaysSinceDelivery <= 7;
    
    if (!isWithin7Days) {
      return {
        eligible: false,
        badge: 'Délai Dépassé',
        title: 'Non éligible au droit de rétractation (Délai légal échu)',
        explanation: `La Loi N° 2011/012 fixe le délai de rétractation à 7 jours calendaires après livraison. Ce délai étant écoulé (${simDaysSinceDelivery} jours), le retour standard n'est plus recevable sauf vice caché avéré.`,
        action: 'Si vous constatez un défaut de fabrication ou vice caché, contactez notre service client pour une expertise sous garantie légale.',
        color: 'rose'
      };
    }

    if (simItemType === 'custom_item') {
      return {
        eligible: false,
        badge: 'Article Personnalisé / Sur-Mesure',
        title: 'Non éligible aux retours selon l\'Article 7 des CGV',
        explanation: 'Conformément aux exceptions légales camerounaises du e-commerce, les confections réalisées sur mesure (plaids aux dimensions spécifiques, objets teints à façon, gravures artisanales) ne peuvent faire l’objet d’une rétractation.',
        action: 'En cas d\'erreur de notre part par rapport à votre commande initiale, notre garantie de conformité s\'applique immédiatement.',
        color: 'rose'
      };
    }

    if (simItemType === 'yarn_opened' || simItemType === 'accessory_opened') {
      return {
        eligible: false,
        badge: 'Article Entamé ou Déscellé',
        title: 'Non éligible au retour pour remise en stock',
        explanation: 'Pour des raisons strictes de conformité textile et de métrage garanti, les pelotes dévidées/coupées ou sans bague de bain d’origine ainsi que les accessoires dont l’emballage étanche est rompu ne sont pas repris.',
        action: 'Conservez toujours l\'emballage d\'origine intact si vous hésitez sur votre coloris ou numéro d\'aiguille.',
        color: 'amber'
      };
    }

    return {
      eligible: true,
      badge: 'Éligible au Retour & Remboursement',
      title: 'Votre article est 100% éligible au retour sous 7 jours',
      explanation: 'Votre pelote intacte (avec bague d’origine) ou accessoire scellé respecte parfaitement les critères de la Loi 2011/012 sur la protection du consommateur.',
      action: 'Générez votre bon de rétractation ci-dessous et expédiez votre colis sous 48h pour un remboursement instantané par Mobile Money (MTN MoMo ou Orange Money).',
      color: 'emerald'
    };
  }, [simItemType, simDaysSinceDelivery]);

  // Generated Withdrawal Text
  const generatedWithdrawalText = useMemo(() => {
    const methodLabel = formRefundMethod === 'momo' ? 'MTN Mobile Money' : formRefundMethod === 'om' ? 'Orange Money Cameroun' : 'Avoir / Bon d\'achat Laine & Déco';
    return `MODÈLE DE FORMULAIRE DE RÉTRACTATION (Loi Camerounaise N° 2011/012)
À l'attention de : Laine et Déco (Landry & Dolères) - Douala, Cameroun
Email : contact@laineetdeco.cm | Support : +237 6XX XX XX XX

Je vous notifie par la présente ma rétractation du contrat portant sur la vente des articles ci-dessous :
- Nom & Prénom du Client : ${formCustomerName || '[Votre Nom]'}
- N° de Commande : ${formOrderNumber || '[N° Commande]'}
- Date de Réception du Colis : ${formDeliveryDate || '[Date de livraison]'}
- Articles retournés (Désignation & Quantité) : ${formArticles || '[Ex: 3 pelotes Laine Mérinos Bleu Nuit, bague intacte]'}
- Mode de Remboursement souhaité : ${methodLabel}
- N° de Téléphone de Remboursement : ${formPhoneNumber || '[Numéro de téléphone OM/MoMo]'}

Déclaration sur l'honneur :
Je certifie que les pelotes et accessoires retournés sont dans leur état d'origine neuf, non entamés, munis de leur bague de référence et emballés conformément aux recommandations de transport.

Date : ${new Date().toLocaleDateString('fr-FR')}
Signature / Validation électronique : ${formCustomerName || '[Nom du Client]'}`;
  }, [formCustomerName, formOrderNumber, formDeliveryDate, formArticles, formRefundMethod, formPhoneNumber]);

  const handleCopyForm = () => {
    navigator.clipboard.writeText(generatedWithdrawalText);
    setCopiedForm(true);
    setTimeout(() => setCopiedForm(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(generatedWithdrawalText);
    window.open(`https://wa.me/237690000000?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0C0E0C] pb-24 text-primary dark:text-[#EAECE9] transition-colors print:bg-white print:text-black">
      
      {/* ========================================================================= */}
      {/* HERO HEADER */}
      {/* ========================================================================= */}
      <div className="bg-[#2D3E31] dark:bg-[#121612] text-white pt-24 pb-16 px-4 rounded-b-[2.5rem] md:rounded-b-[3.5rem] relative overflow-hidden shadow-xl border-b border-white/10 print:hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {onNavigate && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 border border-white/15 shadow-sm"
              >
                <ArrowLeft size={14} />
                Retour à l'accueil
              </button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/25 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/40 shadow-sm"
          >
            <Scale size={14} className="text-accent-light" />
            Cadre Contractuel & Réglementation Camerounaise
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight font-bold"
          >
            Conditions Générales (CGV & CGU)
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-8"
          >
            Régissant les commandes de pelotes nobles, fournitures de mercerie, objets de décoration d'intérieur faits main et l'utilisation de la plateforme <strong>Laine et Déco</strong> selon les lois de la République du Cameroun.
          </motion.p>

          {/* Quick Pillars Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-8 text-left text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <ShieldCheck size={16} />
                <span>Sécurité MoMo / CB</span>
              </div>
              <p className="text-[11px] text-white/70">Paiements certifiés MTN MoMo, Orange Money & cartes bancaires.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Truck size={16} />
                <span>24h-48h à Douala</span>
              </div>
              <p className="text-[11px] text-white/70">Coursier direct Douala et agences agréées Yaoundé & Régions.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <RotateCcw size={16} />
                <span>Droit de Retour 7j</span>
              </div>
              <p className="text-[11px] text-white/70">Conformité Loi 2011/012 sur pelotes et fournitures scellées.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Sparkles size={16} />
                <span>Bains de Teinture</span>
              </div>
              <p className="text-[11px] text-white/70">Engagement de lots identiques par commande de laine.</p>
            </div>
          </div>

          {/* Primary Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto bg-black/25 p-1.5 rounded-2xl sm:rounded-full backdrop-blur-md border border-white/10">
            <button
              onClick={() => setActiveTab('cgv')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cgv'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileCheck size={14} />
              Vente (CGV)
            </button>

            <button
              onClick={() => setActiveTab('cgu')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cgu'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              Utilisation (CGU)
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'shipping'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Truck size={14} />
              Livraisons
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'returns'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <RotateCcw size={14} />
              Simulateur Retours
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText size={14} />
              Formulaire Rétractation
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HelpCircle size={14} />
              FAQ Juridique
            </button>

            <button
              onClick={() => setActiveTab('law')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'law'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Scale size={14} />
              Lois Cameroun
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BODY CONTENT */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
        
        {/* Action / Search Bar */}
        <div className="bg-white dark:bg-[#181C18] rounded-2xl p-4 shadow-sm border border-primary/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Rechercher une clause (ex: MoMo, bain, 7 jours, Douala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-white/10 text-xs font-semibold text-primary dark:text-white transition-colors"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimer / PDF</span>
            </button>
            <span className="text-[11px] text-primary/60 dark:text-white/60 bg-primary/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-primary/5">
              Réglementation 2026
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CGV (CONDITIONS GÉNÉRALES DE VENTE) */}
        {/* ========================================================================= */}
        {activeTab === 'cgv' && (
          <div className="space-y-6">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <Info size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>Contrat de Vente Électronique :</strong> En application de la <em>Loi N° 2010/021 sur le commerce électronique</em> et de la <em>Loi N° 2011/012 sur la protection du consommateur</em> au Cameroun, la validation d’une commande entraîne l’adhésion sans réserve aux 12 articles des présentes CGV.
              </div>
            </div>

            {/* Article 1 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 1 – Identification de l'Entreprise & Cadre Contractuel
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Mentions d'exploitation et compétence territoriale</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les présentes Conditions Générales de Vente (ci-après <strong>« CGV »</strong>) s’appliquent à l’ensemble des ventes d’articles de mercerie, pelotes de laine, kits de tricot/crochet, accessoires et créations de décoration d'intérieur conclues sur le site et l'application <strong>Laine et Déco</strong> (exploité par Landry & Dolères, domicilié à Douala, Région du Littoral, République du Cameroun – ci-après <strong>« le Vendeur »</strong>) auprès de tout acheteur particulier ou professionnel (ci-après <strong>« le Client »</strong>).
                </p>
                <p>
                  Ces CGV sont consultables et téléchargeables en permanence. Elles prévalent sur tout échange préalable ou document contradictoire non validé par écrit par la direction de Laine et Déco.
                </p>
              </div>
            </article>

            {/* Article 2 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 2 – Spécificités des Laines, Bains de Teinture (Dye Lots) & Confections
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Garanties sur la composition textile et l'uniformité des pelotes</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Chaque fiche produit détaille la composition précise des fibres (laine mérinos, alpaga, mohair, coton peigné, acrylique premium), le grammage, le métrage approximatif, l'échantillon préconisé et le calibre d'aiguilles/crochets conseillé.
                </p>
                
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle size={16} />
                    Clause Impérative sur les Bains de Teinture (Dye Lots) :
                  </div>
                  <p>
                    La teinture des fibres nobles et naturelles pouvant présenter d’infimes variations de nuance selon les cuves de production artisanale, le Vendeur garantit l’envoi de pelotes issues d’un <strong>même numéro de bain de teinture</strong> pour toute quantité commandée en une seule fois (dans la limite des stocks disponibles). Le Client est vivement invité à calculer le métrage global nécessaire à son ouvrage dès la commande initiale afin d'éviter tout écart de teinte lors d'un réapprovisionnement ultérieur.
                  </p>
                </div>

                <p>
                  Les photographies sont réalisées avec le plus grand soin technique mais ne peuvent restituer à 100% l'éclat chromatique selon le calibrage colorimétrique de chaque écran (smartphone, tablette, PC).
                </p>
              </div>
            </article>

            {/* Article 3 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 3 – Prix, Devises (Franc CFA / XAF) & Facturation Numérique
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Transparence des coûts et taxes applicables</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les prix de nos articles sont fermes, non négociables et exprimés en <strong>Francs CFA (FCFA / XAF)</strong>, toutes taxes applicables comprises (TTC).
                </p>
                <p>
                  Les tarifs affichés sur les fiches produits ne comprennent pas les frais d'expédition et d'emballage étanche, lesquels sont calculés et présentés de manière transparente au Client avant la validation finale du panier en fonction de la ville de destination au Cameroun.
                </p>
                <p>
                  Le Vendeur se réserve le droit de modifier ses tarifs à tout moment. Toutefois, le prix facturé au Client sera strictement celui affiché au moment de la confirmation définitive de la commande. Une facture ou reçu électronique horodaté est émis immédiatement et accessible depuis l'espace client.
                </p>
              </div>
            </article>

            {/* Article 4 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 4 – Processus de Commande & Double-Clic (Loi 2010/021)
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Validation légale du consentement de l'acheteur</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Conformément à la <strong>Loi camerounaise N° 2010/021 du 21 décembre 2010 régissant le commerce électronique</strong>, la passation de commande suit le processus du double-clic garantissant le consentement éclairé du Client :
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-2 text-xs sm:text-sm">
                  <li><strong>Sélection des articles :</strong> Ajout des pelotes, coloris, kits ou créations dans le panier interactif.</li>
                  <li><strong>Contrôle et modification du panier :</strong> Vérification des quantités, saisie éventuelle d'un code promotionnel ou d'un bon d'achat.</li>
                  <li><strong>Informations de livraison :</strong> Choix de la ville (Douala, Yaoundé, etc.), adresse détaillée et saisie du <strong>numéro de téléphone joignable</strong> (obligatoire pour la coordination par le transporteur).</li>
                  <li><strong>Validation contractuelle :</strong> Acceptation des présentes CGV via case à cocher et clic sur le bouton de paiement.</li>
                  <li><strong>Accusé de réception électronique :</strong> Envoi instantané d'une notification et confirmation par email avec récapitulatif des articles et référence unique de commande.</li>
                </ol>
              </div>
            </article>

            {/* Article 5 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  05
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 5 – Moyens de Paiement Autorisés & Sécurisation
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">MTN Mobile Money, Orange Money & Cartes Bancaires</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Le règlement de vos achats s'effectue comptant selon les modalités suivantes :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">1. Mobile Money (Cameroun)</strong>
                    <span className="text-primary/70 dark:text-white/70">MTN MoMo (*126#) et Orange Money (*150#) avec validation par code PIN sécurisé sur le mobile de l'acheteur.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">2. Cartes Bancaires</strong>
                    <span className="text-primary/70 dark:text-white/70">Visa & Mastercard via passerelle chiffrée SSL/3D Secure. Aucune coordonnée bancaire n'est stockée sur nos serveurs.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">3. Espèces à la Livraison</strong>
                    <span className="text-primary/70 dark:text-white/70">Valable exclusivement sur Douala intramuros lors de la remise en main propre par coursier agréé.</span>
                  </div>
                </div>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  En cas d'incident de paiement, de rejet bancaire ou d'échec de validation Mobile Money, la commande est automatiquement suspendue jusqu'à régularisation.
                </p>
              </div>
            </article>

            {/* Article 6 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  06
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 6 – Expédition, Délais de Livraison & Réception des Colis
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Organisation logistique sur Douala, Yaoundé et tout le Cameroun</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les commandes sont préparées sous 24h ouvrées et expédiées selon les modalités suivantes :
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Douala (Centre, Akwa, Bonanjo, Bonapriso, Bali, Deido, etc.) :</strong> Livraison par coursier express sous <strong>24h à 48h ouvrées</strong>.</li>
                  <li><strong>Yaoundé, Bafoussam, Kribi, Garoua, etc. :</strong> Acheminement par agences de voyages partenaires de premier plan (Buca Voyages, Finexs, Touristique, etc.) sous <strong>48h à 72h ouvrées</strong> avec notification SMS de mise à disposition au point relais.</li>
                </ul>
                <p className="text-xs sm:text-sm">
                  <strong>Vérification à la remise :</strong> Le Client est tenu de vérifier l’état du paquet et la présence des articles dès la livraison. En cas d’avarie ou de spoliation, des réserves motivées doivent être formulées auprès du livreur et confirmées sous 48h auprès du support Laine & Déco.
                </p>
              </div>
            </article>

            {/* Article 7 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  07
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 7 – Droit de Rétractation (Loi 2011/012) & Retours
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Délai de 7 jours, conditions d'acceptation et remboursements</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Conformément à l’<strong>Article 27 de la Loi N° 2011/012 portant protection du consommateur au Cameroun</strong>, le Client bénéficie d’un délai de <strong>sept (7) jours calendaires</strong> à compter de la réception de son colis pour exercer son droit de rétractation.
                </p>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-2 text-xs sm:text-sm">
                  <span className="font-bold text-primary dark:text-white block">Conditions impératives pour l'acceptation du retour :</span>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-primary/70 dark:text-white/70">
                    <li>Les pelotes de laine doivent être neuves, <strong>non tricotées, non coupées, non dévidées et munies de leur bague de référence intacte</strong>.</li>
                    <li>Les fournitures de mercerie (crochets, aiguilles circulaires, ciseaux) doivent être dans leur conditionnement d'origine scellé.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm">
                  <strong>Exception légale formelle :</strong> Le droit de rétractation ne s’applique pas aux articles personnalisés, teints sur demande spéciale ou confectionnés sur mesure (plaids aux dimensions sur mesure, objets décoratifs gravés).
                </div>
              </div>
            </article>

            {/* Article 8 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  08
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 8 – Garanties Légales de Conformité & Vices Cachés (Acte OHADA)
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Couverture contre les défauts matériels de fabrication</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les produits vendus par Laine et Déco bénéficient de plein droit de la garantie légale de conformité et de la garantie contre les vices cachés, conformément à l’<strong>Acte Uniforme OHADA portant sur le Droit Commercial Général</strong> :
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Défaut de conformité :</strong> Remplacement sans frais ou remboursement en cas de livraison d'un article non conforme au bon de commande validé.</li>
                  <li><strong>Vice caché :</strong> Prise en charge des défauts invisibles lors de l'achat rendant la fibre ou l'accessoire impropre à son usage normal.</li>
                </ul>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  Sont exclus de la garantie les dommages causés par une utilisation anormale (lavage en machine à température inadaptée provoquant un feutrage accidentel, exposition à des agents chimiques corrosifs).
                </p>
              </div>
            </article>

            {/* Article 9 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  09
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 9 – Réserve de Propriété & Transfert des Risques
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Propriété des biens jusqu'au complet encaissement</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Le Vendeur conserve la propriété pleine et entière des produits vendus jusqu'au parfait encaissement du prix principal, frais et taxes compris.
                </p>
                <p>
                  Le transfert des risques de perte et de détérioration des marchandises s’opère au moment où le Client (ou son mandataire désigné) prend physiquement possession des articles livrés.
                </p>
              </div>
            </article>

            {/* Article 10 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  10
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 10 – Cartes Cadeaux, Bons d'Achat & Avoirs
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Durée de validité et conditions d'imputation</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les cartes cadeaux numériques et avoirs émis par Laine et Déco ont une durée de validité de <strong>douze (12) mois</strong> à compter de leur date d'émission. Ils sont utilisables en une ou plusieurs fois sur l'ensemble de la boutique. Ils ne peuvent donner lieu à un remboursement en numéraire ni à un rendu de monnaie en espèces.
                </p>
              </div>
            </article>

            {/* Article 11 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  11
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 11 – Force Majeure & Événements Imprévisibles
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Suspension temporaire des obligations d'acheminement</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  L’exécution des obligations du Vendeur aux termes des présentes est suspendue en cas de survenance d’un cas fortuit ou de force majeure (intempéries exceptionnelles perturbant le réseau routier interurbain, grèves des transporteurs nationaux, interruption prolongée des réseaux télécoms ou bancaires nationaux, émeutes ou décisions gouvernementales contraignantes). Le Vendeur avertira le Client de la survenance d’un tel événement dès que possible.
                </p>
              </div>
            </article>

            {/* Article 12 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  12
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 12 – Règlement des Différends & Juridiction Compétente
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Médiation amiable et compétence des Tribunaux de Douala</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Les présentes CGV sont soumises à la législation de la <strong>République du Cameroun</strong>.
                </p>
                <p>
                  En cas de réclamation ou litige, le Client s’adressera en priorité au service client de Laine et Déco par email (<a href="mailto:contact@laineetdeco.cm" className="text-accent underline font-semibold">contact@laineetdeco.cm</a>) ou WhatsApp afin de trouver une <strong>solution amiable</strong> sous trente (30) jours.
                </p>
                <p>
                  À défaut d’accord amiable, le litige sera porté devant les <strong>Tribunaux compétents de la ville de Douala (Région du Littoral, Cameroun)</strong>.
                </p>
              </div>
            </article>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CGU (CONDITIONS GÉNÉRALES D'UTILISATION DU SITE) */}
        {/* ========================================================================= */}
        {activeTab === 'cgu' && (
          <div className="space-y-6">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <BookOpen size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>Charte d'Utilisation de la Plateforme :</strong> Ces CGU encadrent l’accès aux services en ligne, à l'espace personnel, aux générateurs de patrons IA et au catalogue interactif conformément à la <em>Loi N° 2010/012 sur la cybersécurité et la cybercriminalité au Cameroun</em>.
              </div>
            </div>

            {/* CGU 1 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 1 – Objet du Service en Ligne & Acceptation
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Conditions d'accès universel et adhésion</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  La plateforme <strong>Laine et Déco</strong> a pour vocation de proposer une vitrine d'achat en ligne pour les laines et objets de décoration, tout en fournissant aux passionnés de loisirs créatifs des modules d'assistance numérique (calculateurs de pelotes, générateur de modèles, suivi de commandes).
                </p>
                <p>
                  L’utilisation du site, que ce soit en simple visiteur ou en utilisateur connecté, implique l’acceptation pleine et entière des présentes conditions.
                </p>
              </div>
            </article>

            {/* CGU 2 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 2 – Compte Utilisateur & Confidentialité des Identifiants
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Responsabilité de l'utilisateur sur la sécurité de son compte</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  L’accès à certaines fonctionnalités (historique d’achats, liste d’envies, projets sauvegardés) requiert la création d’un compte. L'utilisateur s'engage à fournir des informations réelles et complètes (nom, email valide, numéro de téléphone joignable au Cameroun).
                </p>
                <p>
                  Le mot de passe associé au compte est strictement personnel. L'utilisateur assume l'entière responsabilité des actions réalisées depuis son espace. En cas de suspicion de piratage, l'utilisateur doit en avertir sans délai le support technique.
                </p>
              </div>
            </article>

            {/* CGU 3 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 3 – Modules d'Intelligence Artificielle & Valeur Indicative
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Portée des estimations du calculateur et du Compagnon Tricot</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Laine et Déco met à disposition des utilisateurs des outils intelligents :
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                  <li><strong>Calculateur de métrage et pelotes :</strong> Estime le nombre théorique de pelotes nécessaires en fonction du projet et des dimensions renseignées. Chaque tricoteur ayant une tension de fil personnelle (échantillon plus serré ou plus lâche), cette valeur est fournie à titre indicatif.</li>
                  <li><strong>Générateur de Patrons & Compagnon IA :</strong> Fournit des conseils de création et des grilles de tricot indicatives ne pouvant engager la responsabilité du Vendeur en cas d'imprécision sur des modèles complexes.</li>
                </ul>
              </div>
            </article>

            {/* CGU 4 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 4 – Propriété Intellectuelle des Créations & Contenus
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Protection des patrons originaux, tutoriels et visuels</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  Tous les éléments de la plateforme (textes, logos, photographies d'artisanat, tutoriels, chartes graphiques et patrons exclusifs édités par Laine & Déco) sont protégés par le <strong>Droit de la Propriété Intellectuelle (OAPI)</strong>.
                </p>
                <p>
                  Toute reproduction totale ou partielle, extraction de données ou commercialisation non autorisée de nos modèles originaux est strictement prohibée.
                </p>
              </div>
            </article>

            {/* CGU 5 */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  05
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    Article 5 – Cybersécurité & Interdictions Légales (Loi 2010/012)
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Sanctions pénales en cas d'atteinte aux systèmes de données</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-primary/80 dark:text-white/80 space-y-3">
                <p>
                  En application de la <strong>Loi camerounaise N° 2010/012 du 21 décembre 2010 relative à la cybersécurité et la cybercriminalité</strong>, il est formellement interdit :
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-primary/80 dark:text-white/80">
                  <li>De mener des attaques en déni de service, tentatives d'intrusion ou injection de code malveillant.</li>
                  <li>D'utiliser des robots d'extraction massive (scraping) sur le catalogue de prix ou les visuels de la boutique.</li>
                  <li>D'usurper l'identité de tiers ou d'utiliser frauduleusement des comptes de paiement Mobile Money.</li>
                </ul>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  Toute violation donnera lieu à des poursuites judiciaires immédiates devant les juridictions répressives camerounaises compétentes.
                </p>
              </div>
            </article>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SHIPPING & LOGISTIQUE */}
        {/* ========================================================================= */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Truck size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    Grille Logistique & Modalités d'Acheminement
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Couverture des 10 régions du Cameroun avec protection étanche</p>
                </div>
              </div>

              {/* Grid zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary dark:text-white">Zone 1 : Douala Intramuros</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">24h - 48h</span>
                  </div>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Livraison à domicile ou sur votre lieu de travail par coursier dédié (Akwa, Bonanjo, Bonapriso, Bali, Deido, Denver, Kotto, Makepe, Logbessou, etc.).
                  </p>
                  <div className="pt-2 border-t border-primary/10 dark:border-white/10 text-xs flex justify-between items-center font-semibold">
                    <span>Tarif indicatif :</span>
                    <span className="text-accent text-sm font-bold">1 000 à 2 000 FCFA</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary dark:text-white">Zone 2 : Yaoundé & Périphérie</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">48h - 72h</span>
                  </div>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Acheminement par agences partenaires agréées (Buca Voyages, Finexs, etc.) avec retrait en agence ou livraison relais coursier.
                  </p>
                  <div className="pt-2 border-t border-primary/10 dark:border-white/10 text-xs flex justify-between items-center font-semibold">
                    <span>Tarif indicatif :</span>
                    <span className="text-accent text-sm font-bold">2 000 à 3 000 FCFA</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary dark:text-white">Zone 3 : Ouest, Sud & Littoral</span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">48h - 72h</span>
                  </div>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Bafoussam, Kribi, Edea, Limbe, Buea, Dschang via agences de transport interurbain avec numéro de bordereau.
                  </p>
                  <div className="pt-2 border-t border-primary/10 dark:border-white/10 text-xs flex justify-between items-center font-semibold">
                    <span>Tarif indicatif :</span>
                    <span className="text-accent text-sm font-bold">2 500 à 3 500 FCFA</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary dark:text-white">Zone 4 : Grand Nord & Est</span>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">3 à 5 jours</span>
                  </div>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Ngaoundéré, Garoua, Maroua, Bertoua via transporteurs spécialisés avec emballage renforcé anti-poussière.
                  </p>
                  <div className="pt-2 border-t border-primary/10 dark:border-white/10 text-xs flex justify-between items-center font-semibold">
                    <span>Tarif indicatif :</span>
                    <span className="text-accent text-sm font-bold">3 500 à 5 000 FCFA</span>
                  </div>
                </div>

              </div>

              {/* Protective Packaging */}
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 text-xs leading-relaxed space-y-2 text-primary/80 dark:text-white/80">
                <div className="flex items-center gap-2 font-bold text-accent">
                  <Sparkles size={16} />
                  <span>Emballage Double Protection Spécial Fibre Textile :</span>
                </div>
                <p>
                  Toutes nos pelotes et confections sont conditionnées sous pochette étanche thermosoudée anti-humidité avant mise en carton renforcé. Vos laines arrivent ainsi à destination avec leur douceur et leur parfum intacts, prêtes à être tricotées.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTERACTIVE SIMULATOR FOR RETURNS */}
        {/* ========================================================================= */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    Simulateur Interactif d'Éligibilité aux Retours
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Vérifiez instantanément la conformité de votre retour selon la Loi Camerounaise</p>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Step 1: Item Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary dark:text-white block">
                    1. Quel type d'article souhaitez-vous retourner ?
                  </label>
                  <select
                    value={simItemType}
                    onChange={(e) => setSimItemType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-xs font-semibold text-primary dark:text-white focus:ring-1 focus:ring-accent outline-none"
                  >
                    <option value="yarn_intact">Pelote de laine neuve (Bague intacte, non coupée)</option>
                    <option value="yarn_opened">Pelote de laine entamée / dévidée / bague perdue</option>
                    <option value="accessory_sealed">Accessoire de mercerie sous blister scellé</option>
                    <option value="accessory_opened">Accessoire de mercerie déballé / utilisé</option>
                    <option value="custom_item">Création confectionnée sur-mesure / personnalisée</option>
                  </select>
                </div>

                {/* Step 2: Delivery Date Delay */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary dark:text-white block">
                    2. Depuis combien de jours avez-vous reçu le colis ?
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={simDaysSinceDelivery}
                      onChange={(e) => setSimDaysSinceDelivery(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <span className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shrink-0">
                      {simDaysSinceDelivery} jour{simDaysSinceDelivery > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-primary/60 dark:text-white/60">
                    Délai légal camerounais : 7 jours calendaires à date de réception.
                  </p>
                </div>

              </div>

              {/* Dynamic Result Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                simulationResult.eligible
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {simulationResult.eligible ? (
                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm sm:text-base">
                    {simulationResult.title}
                  </span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed mb-3 opacity-90">
                  {simulationResult.explanation}
                </p>

                <div className="p-3 rounded-xl bg-white/60 dark:bg-black/30 text-xs font-medium space-y-1">
                  <span className="font-bold block">Recommandation légale :</span>
                  <p>{simulationResult.action}</p>
                </div>
              </div>

              {/* 3 Steps summary */}
              <div className="pt-4 border-t border-primary/10 dark:border-white/10">
                <h3 className="text-sm font-bold text-primary dark:text-white mb-3">
                  Marche à suivre pour un retour en 3 étapes :
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">1. Signalement</strong>
                    <span className="text-primary/70 dark:text-white/70">Remplissez le formulaire de rétractation (onglet suivant) et transmettez-le par WhatsApp ou Email.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">2. Expédition</strong>
                    <span className="text-primary/70 dark:text-white/70">Emballez soigneusement vos pelotes intactes et déposez-les auprès de notre coursier ou en agence relais.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">3. Remboursement</strong>
                    <span className="text-primary/70 dark:text-white/70">Validation du colis sous 24h et transfert immédiat sur votre compte MTN MoMo ou Orange Money.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GENERATEUR DE FORMULAIRE DE RÉTRACTATION */}
        {/* ========================================================================= */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    Générateur Officiel de Formulaire de Rétractation
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Modèle légal conforme à la Loi N° 2011/012 (Cameroun) pour vos retours et remboursements</p>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">Nom & Prénom complet :</label>
                  <input
                    type="text"
                    placeholder="Ex: Landry Moutongo"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">Numéro de Commande :</label>
                  <input
                    type="text"
                    placeholder="Ex: LD-2026-8941"
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">Date de réception du colis :</label>
                  <input
                    type="date"
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">Mode de remboursement préféré :</label>
                  <select
                    value={formRefundMethod}
                    onChange={(e) => setFormRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  >
                    <option value="momo">MTN Mobile Money (*126#)</option>
                    <option value="om">Orange Money Cameroun (*150#)</option>
                    <option value="credit">Avoir / Bon d'achat immédiat (+5% de bonus)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-primary dark:text-white">Articles retournés & Numéro de téléphone Mobile Money :</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Ex: 4 pelotes Mérinos Camel (Bague intacte)"
                      value={formArticles}
                      onChange={(e) => setFormArticles(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Ex: +237 6XX XX XX XX"
                      value={formPhoneNumber}
                      onChange={(e) => setFormPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-accent" />
                    Texte contractuel généré prêt à l'envoi :
                  </span>
                  <button
                    onClick={handleCopyForm}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-bold"
                  >
                    {copiedForm ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copiedForm ? 'Copié !' : 'Copier le texte'}
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-[11px] sm:text-xs font-mono whitespace-pre-wrap leading-relaxed text-primary/80 dark:text-white/80 select-all overflow-x-auto">
                  {generatedWithdrawalText}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyForm}
                  className="gap-2 text-xs font-bold"
                >
                  <Copy size={14} />
                  {copiedForm ? 'Copié dans le presse-papier' : 'Copier pour Email'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendWhatsApp}
                  className="gap-2 text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white border-transparent"
                >
                  <MessageSquare size={14} />
                  Transmettre via WhatsApp au Support
                </Button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FAQ JURIDIQUE & PRATIQUE */}
        {/* ========================================================================= */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <HelpCircle size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>Questions Fréquentes Juridiques & Pratiques :</strong> Retrouvez ici les réponses transparentes aux questions contractuelles les plus courantes sur vos commandes Laine et Déco.
              </div>
            </div>

            {/* FAQ Item 1 */}
            <div className="bg-white dark:bg-[#181C18] rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq('faq-1')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-primary dark:text-white hover:bg-primary/5 transition-colors"
              >
                <span>1. Que faire si une pelote présente un nœud de raccordement d'usine ?</span>
                {expandedFaq['faq-1'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-1'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    Dans les filatures de laine haut de gamme, la présence de 1 à 2 nœuds discrets par pelote de 100g est une tolérance industrielle textile normale issue du raccordement des mèches de filage.
                  </p>
                  <p>
                    Toutefois, si une pelote présente des ruptures répétées anormales ou un défaut de torsion évident, notre garantie de conformité s'applique : envoyez-nous une photo et nous vous remplaçons la pelote sans frais.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white dark:bg-[#181C18] rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq('faq-2')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-primary dark:text-white hover:bg-primary/5 transition-colors"
              >
                <span>2. Puis-je faire réserver des pelotes d'un bain de teinture spécifique ?</span>
                {expandedFaq['faq-2'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-2'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    Oui ! Si vous avez un gros projet de tricot (châle, pull ou plaid) et souhaitez être certain d'avoir un lot complet identique, vous pouvez nous contacter directement avant commande. Nous réservons vos pelotes sous le même numéro de bain (Dye Lot) pendant 48 heures ouvrées.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white dark:bg-[#181C18] rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq('faq-3')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-primary dark:text-white hover:bg-primary/5 transition-colors"
              >
                <span>3. Comment obtenir une facture officielle avec NIF / RCCM pour mon entreprise ?</span>
                {expandedFaq['faq-3'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-3'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    Lors de votre commande, renseignez le nom de votre société dans le champ adresse ou envoyez un message au service comptabilité (<a href="mailto:compta@laineetdeco.cm" className="text-accent underline font-semibold">compta@laineetdeco.cm</a>) avec votre N° de commande, NIF et RCCM. Une facture numérique certifiée aux normes de la Direction Générale des Impôts (DGI) vous sera transmise sous 24h.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white dark:bg-[#181C18] rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq('faq-4')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-primary dark:text-white hover:bg-primary/5 transition-colors"
              >
                <span>4. Que se passe-t-il si je suis absent au moment du passage du coursier à Douala ?</span>
                {expandedFaq['faq-4'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-4'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    Le coursier prend toujours contact par téléphone avant son passage. En cas d'indisponibilité imprévue, un second passage gratuit est reprogrammé le lendemain ou votre colis peut être mis en garde sécurisée dans notre point de retrait partenaire à Akwa.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: LOIS CAMEROUNAISES & OHADA */}
        {/* ========================================================================= */}
        {activeTab === 'law' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Scale size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    Textes Législatifs et Réglementaires Applicables
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Cadre juridique de la République du Cameroun et de l'espace OHADA</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-primary/80 dark:text-white/80">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">1. Loi N° 2010/021 du 21 décembre 2010 régissant le commerce électronique au Cameroun</h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Fixe les conditions de validité des contrats conclus par voie électronique, la responsabilité des prestataires et les obligations d'information précontractuelle.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">2. Loi N° 2011/012 du 6 mai 2011 portant protection du consommateur au Cameroun</h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Garantit les droits fondamentaux des consommateurs, la sécurité des produits vendus, le droit de rétractation et la loyauté des transactions commerciales.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">3. Loi N° 2010/012 du 21 décembre 2010 relative à la cybersécurité et la cybercriminalité</h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Encadre la sécurité des réseaux, la protection des données électroniques et réprime les atteintes aux systèmes automatisés de données.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">4. Acte Uniforme OHADA révisé portant sur le Droit Commercial Général</h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    Régit les obligations réciproques du vendeur et de l'acheteur ainsi que la garantie des vices cachés dans l'espace économique régional.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Footer Contact Banner */}
        <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
          <div>
            <h4 className="font-bold text-sm text-primary dark:text-white">Une question sur vos droits, un retour ou une commande ?</h4>
            <p className="text-xs text-primary/70 dark:text-white/70">Notre équipe commerciale et juridique est à votre disposition pour vous accompagner.</p>
          </div>
          {onNavigate && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('contact')}
                className="gap-2 text-xs shrink-0 font-bold"
              >
                <Mail size={14} />
                Contacter le Service Client
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TermsView;

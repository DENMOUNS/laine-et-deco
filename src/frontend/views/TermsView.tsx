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
  Printer,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Check,
  FileText,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../../i18n';

interface TermsViewProps {
  onNavigate?: (view: string) => void;
  initialTab?: 'cgv' | 'cgu' | 'shipping' | 'returns' | 'form' | 'faq' | 'law';
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigate, initialTab = 'cgv' }) => {
  const { isEn } = useTranslation();
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
    'faq-4': false,
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
        badge: isEn ? 'Deadline Expired' : 'Délai Dépassé',
        title: isEn ? 'Not eligible for return (Legal period expired)' : 'Non éligible au droit de rétractation (Délai légal échu)',
        explanation: isEn 
          ? `Cameroonian Law N° 2011/012 sets the return period to 7 calendar days post-delivery. This limit has expired (${simDaysSinceDelivery} days), return is no longer accepted except for hidden defects.`
          : `La Loi N° 2011/012 fixe le délai de rétractation à 7 jours calendaires après livraison. Ce délai étant écoulé (${simDaysSinceDelivery} jours), le retour standard n'est plus recevable sauf vice caché avéré.`,
        action: isEn 
          ? 'If you notice a manufacturing defect or hidden issue, contact our support team for specialized assistance.'
          : 'Si vous constatez un défaut de fabrication ou vice caché, contactez notre service client pour une expertise sous garantie légale.',
        color: 'rose'
      };
    }

    if (simItemType === 'custom_item') {
      return {
        eligible: false,
        badge: isEn ? 'Bespoke / Custom Item' : 'Article Personnalisé / Sur-Mesure',
        title: isEn ? 'Not eligible for return according to Article 7 of T&C' : 'Non éligible aux retours selon l\'Article 7 des CGV',
        explanation: isEn
          ? 'Under Cameroonian e-commerce laws, custom-made items (such as bespoke blankets, custom dyed wool, or hand-made personalized crafts) are excluded from the default return policies.'
          : 'Conformément aux exceptions légales camerounaises du e-commerce, les confections réalisées sur mesure (plaids aux dimensions spécifiques, objets teints à façon, gravures artisanales) ne peuvent faire l’objet d’une rétractation.',
        action: isEn
          ? 'In case of error on our side relative to your initial order, our conformity guarantee applies immediately.'
          : 'En cas d\'erreur de notre part par rapport à votre commande initiale, notre garantie de conformité s\'applique immédiatement.',
        color: 'rose'
      };
    }

    if (simItemType === 'yarn_opened' || simItemType === 'accessory_opened') {
      return {
        eligible: false,
        badge: isEn ? 'Opened / Unsealed Item' : 'Article Entamé ou Déscellé',
        title: isEn ? 'Not eligible for return for restocking' : 'Non éligible au retour pour remise en stock',
        explanation: isEn
          ? 'Due to strict textile conformity standards, unraveled, cut or labelless yarn balls as well as accessories with broken waterproof seals cannot be returned.'
          : 'Pour des raisons strictes de conformité textile et de métrage garanti, les pelotes dévidées/coupées ou sans bague de bain d’origine ainsi que les accessoires dont l’emballage étanche est rompu ne sont pas repris.',
        action: isEn
          ? 'Always keep the original packaging intact if you are unsure about the color shade or needle size.'
          : 'Conservez toujours l\'emballage d\'origine intact si vous hésitez sur votre coloris ou numéro d\'aiguille.',
        color: 'amber'
      };
    }

    return {
      eligible: true,
      badge: isEn ? 'Eligible for Return & Refund' : 'Éligible au Retour & Remboursement',
      title: isEn ? 'Your item is 100% eligible for return under 7 days' : 'Votre article est 100% éligible au retour sous 7 jours',
      explanation: isEn
        ? 'Your pristine, unraveled yarn ball (with original label) or sealed accessory perfectly complies with Consumer Protection Law 2011/012.'
        : 'Votre pelote intacte (avec bague d’origine) ou accessoire scellé respecte parfaitement les critères de la Loi 2011/012 sur la protection du consommateur.',
      action: isEn
        ? 'Generate your withdrawal slip below and ship your parcel within 48h for an instant refund on Mobile Money (MTN MoMo or Orange Money).'
        : 'Générez votre bon de rétractation ci-dessous et expédiez votre colis sous 48h pour un remboursement instantané par Mobile Money (MTN MoMo ou Orange Money).',
      color: 'emerald'
    };
  }, [simItemType, simDaysSinceDelivery, isEn]);

  // Generated Withdrawal Text
  const generatedWithdrawalText = useMemo(() => {
    const methodLabel = formRefundMethod === 'momo' 
      ? 'MTN Mobile Money' 
      : formRefundMethod === 'om' 
        ? 'Orange Money Cameroun' 
        : (isEn ? 'Laine & Déco Store Credit (+5% Bonus)' : 'Avoir / Bon d\'achat Laine & Déco (+5% de bonus)');

    if (isEn) {
      return `WITHDRAWAL FORM MODEL (Cameroonian Law N° 2011/012)
To: Laine et Déco - Douala, Cameroon
Email: contact@laineetdeco.cm | Support: +237 6XX XX XX XX

I hereby notify you of my withdrawal from the sales contract concerning the items below:
- Customer Name: ${formCustomerName || '[Your Name]'}
- Order Number: ${formOrderNumber || '[Order ID]'}
- Delivery Date: ${formDeliveryDate || '[Delivery Date]'}
- Returned Items (Description & Quantity): ${formArticles || '[e.g., 3 Midnight Blue Merino wool balls, intact labels]'}
- Requested Refund Method: ${methodLabel}
- Refund Phone Number: ${formPhoneNumber || '[Momo / Orange Money Number]'}

Declaration of Honor:
I certify that the returned yarn balls and accessories are in their pristine new condition, unopened, with their original reference labels intact and packed securely for transit.

Date: ${new Date().toLocaleDateString('en-US')}
Signature / Electronic Validation: ${formCustomerName || '[Customer Name]'}`;
    }

    return `MODÈLE DE FORMULAIRE DE RÉTRACTATION (Loi Camerounaise N° 2011/012)
À l'attention de : Laine et Déco - Douala, Cameroun
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
  }, [formCustomerName, formOrderNumber, formDeliveryDate, formArticles, formRefundMethod, formPhoneNumber, isEn]);

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
      
      {/* HERO HEADER */}
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
                {isEn ? 'Back to home' : "Retour à l'accueil"}
              </button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/25 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/40 shadow-sm"
          >
            <Scale size={14} className="text-accent-light" />
            {isEn ? 'Contractual Framework & Cameroonian Regulation' : 'Cadre Contractuel & Réglementation Camerounaise'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight font-bold"
          >
            {isEn ? 'General Terms & Policies' : 'Conditions Générales (CGV & CGU)'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-8"
          >
            {isEn 
              ? 'Governing orders of premium yarn, crochet hooks, needles, handmade craft accessories and the use of Laine et Déco according to the laws of the Republic of Cameroon.' 
              : "Régissant les commandes de pelotes de laine nobles, de crochets, d'aiguilles, d'accessoires d'artisanat faits main et l'utilisation de la plateforme Laine et Déco selon les lois de la République du Cameroun."}
          </motion.p>

          {/* Quick Pillars Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-8 text-left text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <ShieldCheck size={16} />
                <span>{isEn ? 'MoMo / Card Security' : 'Sécurité MoMo / CB'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Certified MTN MoMo, Orange Money & Credit Card payments.' : 'Paiements certifiés MTN MoMo, Orange Money & cartes bancaires.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Truck size={16} />
                <span>{isEn ? '24h-48h Delivery' : 'Livraison 24h-48h'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Direct express courier in Douala and certified logistics in Yaoundé & Regions.' : 'Coursier direct Douala et agences agréées Yaoundé & Régions.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <RotateCcw size={16} />
                <span>{isEn ? '7-Day Return Right' : 'Droit de Retour 7j'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Compliance with Law 2011/012 on sealed yarns and items.' : 'Conformité Loi 2011/012 sur pelotes et fournitures scellées.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Sparkles size={16} />
                <span>{isEn ? 'Identical Dye Lots' : 'Bains de Teinture'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Guaranteed uniform dyeing batch per wool order.' : 'Engagement de lots identiques par commande de laine.'}
              </p>
            </div>
          </div>

          {/* Primary Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto bg-black/25 p-1.5 rounded-2xl sm:rounded-full backdrop-blur-md border border-white/10">
            <button
              onClick={() => setActiveTab('cgv')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cgv' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileCheck size={14} />
              {isEn ? 'Sales (T&C)' : 'Vente (CGV)'}
            </button>

            <button
              onClick={() => setActiveTab('cgu')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cgu' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              {isEn ? 'Usage (ToS)' : 'Utilisation (CGU)'}
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'shipping' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Truck size={14} />
              {isEn ? 'Shipping' : 'Livraisons'}
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'returns' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <RotateCcw size={14} />
              {isEn ? 'Return Simulator' : 'Simulateur Retours'}
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'form' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText size={14} />
              {isEn ? 'Withdrawal Form' : 'Formulaire Rétractation'}
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'faq' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HelpCircle size={14} />
              {isEn ? 'Legal FAQ' : 'FAQ Juridique'}
            </button>

            <button
              onClick={() => setActiveTab('law')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'law' ? 'bg-accent text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Scale size={14} />
              {isEn ? 'Cameroon Laws' : 'Lois Cameroun'}
            </button>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
        
        {/* Action / Search Bar */}
        <div className="bg-white dark:bg-[#181C18] rounded-2xl p-4 shadow-sm border border-primary/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-white/40" />
            <input
              type="text"
              placeholder={isEn ? "Search a clause (e.g., MoMo, dye lot, 7 days)..." : "Rechercher une clause (ex: MoMo, bain, 7 jours, Douala)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-white/10 text-xs font-semibold text-primary dark:text-white transition-colors"
              title={isEn ? "Print or save as PDF" : "Imprimer ou enregistrer en PDF"}
            >
              <Printer size={14} />
              <span className="hidden sm:inline">{isEn ? 'Print / PDF' : 'Imprimer / PDF'}</span>
            </button>
            <span className="text-[11px] text-primary/60 dark:text-white/60 bg-primary/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-primary/5">
              {isEn ? '2026 Regulations' : 'Réglementation 2026'}
            </span>
          </div>
        </div>

        {/* TAB 1: CGV (CONDITIONS GÉNÉRALES DE VENTE) */}
        {activeTab === 'cgv' && (
          <div className="space-y-6">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <Info size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                {isEn ? (
                  <>
                    <strong>Electronic Sales Agreement:</strong> In accordance with <em>Law N° 2010/021 on electronic commerce</em> and <em>Law N° 2011/012 on consumer protection</em> in Cameroon, checking out represents unconditional acceptance of our T&C.
                  </>
                ) : (
                  <>
                    <strong>Contrat de Vente Électronique :</strong> En application de la <em>Loi N° 2010/021 sur le commerce électronique</em> et de la <em>Loi N° 2011/012 sur la protection du consommateur</em> au Cameroun, la validation d’une commande entraîne l’adhésion sans réserve aux articles des présentes CGV.
                  </>
                )}
              </div>
            </div>

            {/* Simulated CGV Articles for quick translation summary */}
            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 1 – Company Identification & Legal Framework' : "Article 1 – Identification de l'Entreprise & Cadre Contractuel"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> These terms govern all sales of yarn, needles, crochet hooks, and handmade crafts operated under Laine & Déco, domiciled in Douala, Littoral Region, Cameroon, to individual and professional buyers.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Les présentes Conditions Générales de Vente s’appliquent à l’ensemble des ventes d’articles de mercerie, pelotes de laine, kits de tricot, crochets, aiguilles et accessoires d'artisanat conclues sur le site Laine et Déco (domicilié à Douala, Cameroun) auprès de tout acheteur particulier ou professionnel.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 2 – Yarn Specifications & Identical Dye Lots' : "Article 2 – Spécificités des Laines, Bains de Teinture (Dye Lots)"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Laine & Déco guarantees that all wool balls purchased in a single transaction are selected from the <strong>same dye lot (Dye Lot / Bain)</strong> to avoid visible color variations in your project.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Chaque fiche produit détaille la composition, le grammage et le calibre conseillé. Le Vendeur garantit l’envoi de pelotes issues d’un même numéro de bain de teinture pour toute quantité commandée en une seule fois.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 3 – Pricing, Currency (XAF / FCFA) & digital Invoice' : "Article 3 – Prix, Devises (Franc CFA / XAF) & Facturation"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Prices are fixed, stated in Central African CFA Francs (XAF) including all local taxes. Shipping costs are dynamically added to your cart before final order approval.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Les prix de nos articles sont fermes, non négociables et exprimés en Francs CFA (FCFA / XAF), toutes taxes applicables comprises (TTC). Les tarifs n'incluent pas les frais de port, précisés au client avant paiement.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 4 – Double-Click Order Validation (Law 2010/021)' : "Article 4 – Processus de Commande & Double-Clic (Loi 2010/021)"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Pursuant to Law N° 2010/021 on Cameroonian e-commerce, order validation follows a double-click procedure ensuring your explicit consent before checking out.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                La passation de commande suit le processus du double-clic garantissant le consentement éclairé du Client : sélection, contrôle du panier, informations de livraison, acceptation des CGV et paiement.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  05
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 5 – Supported Secure Payment Systems' : "Article 5 – Moyens de Paiement Autorisés & Sécurisation"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Safe instant checkouts through MTN Mobile Money (*126#), Orange Money (*150#) with secure mobile PIN confirmation, and authorized Credit Cards.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Paiement sécurisé via MTN Mobile Money, Orange Money Cameroun, Cartes bancaires (Visa/Mastercard via SSL chiffré) et paiement en espèces exclusif à la livraison sur Douala intramuros.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  06
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 6 – Deliveries, Timelines & Receipt Procedures' : "Article 6 – Expédition, Délais de Livraison & Réception des Colis"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Express parcel shipping under 24/48h in Douala. Shipping to other regions (Yaoundé, Garoua, Kribi, etc.) under 48h/72h through trusted partner agencies (Finexs, Buca, Touristique).
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Commandes traitées sous 24h. Livraison coursier express sous 24h/48h à Douala. Expédition sous 48h/72h vers Yaoundé et autres régions avec notification de mise à disposition par SMS.
              </p>
            </article>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  07
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Article 7 – 7-Day Statutory Withdrawal Right (Law 2011/012)' : "Article 7 – Droit de Rétractation (Loi 2011/012) & Retours"}
                  </h2>
                </div>
              </div>
              {isEn && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-accent font-medium">
                  <strong>English Summary:</strong> Under Cameroonian consumer law, you have 7 calendar days after delivery to return unopened yarns (with original labels intact) or sealed accessories. Custom-made items are legally excluded from returns.
                </div>
              )}
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                Conformément à l’Article 27 de la Loi N° 2011/012 au Cameroun, le Client bénéficie de 7 jours calendaires après livraison pour exercer son droit de rétractation sur des pelotes et outils neufs et scellés.
              </p>
            </article>

          </div>
        )}

        {/* TAB 2: CGU (CONDITIONS GÉNÉRALES D'UTILISATION) */}
        {activeTab === 'cgu' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <BookOpen size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>{isEn ? 'Terms of Service (ToS) Framework:' : "Charte d'Utilisation de la Plateforme :"}</strong> {isEn ? 'Governing digital platform services, user profiles, AI pattern makers and creative boards.' : 'Ces CGU encadrent l’accès aux services en ligne, à l\'espace personnel et aux outils créatifs.'}
              </div>
            </div>

            <article className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-primary dark:text-white">
                {isEn ? 'Article 1 – Platform Purpose & Acceptance' : "Article 1 – Objet du Service en Ligne & Acceptation"}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-primary/70 dark:text-white/70">
                {isEn 
                  ? 'Our digital platform serves as a modern marketplace for fine wool, knitting needles, and handmade products while offering free smart tools like the yarn calculator.' 
                  : "La plateforme Laine et Déco a pour vocation de proposer une vitrine d'achat en ligne pour les laines et fournitures créatives tout en offrant des modules d'assistance interactifs."}
              </p>
            </article>
          </div>
        )}

        {/* TAB 3: SHIPPING (LIVRAISONS) */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <h2 className="text-2xl font-serif font-bold text-primary dark:text-white flex items-center gap-2">
                <Truck className="text-accent" />
                {isEn ? 'Shipping Methods & Rates in Cameroon' : 'Modes d\'Expédition & Tarifs au Cameroun'}
              </h2>
              <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70">
                {isEn 
                  ? 'We deliver all orders from our local inventory in Douala using water-resistant tropicalized packaging to avoid humidity variations.'
                  : 'Nous expédions vos commandes depuis Douala sous emballages scellés étanches conçus pour résister au climat local.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                  <h3 className="font-bold text-sm text-primary dark:text-white">{isEn ? '1. Douala Express (Courier)' : '1. Douala Express (Coursier)'}</h3>
                  <p className="text-primary/70 dark:text-white/70">
                    {isEn ? 'Delivery under 24/48h at home or office. Pay cash on delivery or via Mobile Money.' : 'Livraison sous 24h-48h à domicile ou bureau. Paiement espèces à la livraison ou Mobile Money.'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                  <h3 className="font-bold text-sm text-primary dark:text-white">{isEn ? '2. Yaoundé & Other Regions (Agency)' : '2. Yaoundé & Régions (Agences)'}</h3>
                  <p className="text-primary/70 dark:text-white/70">
                    {isEn ? 'Delivery under 48h/72h through Finexs, Buca or Touristique Express with SMS tracking.' : 'Livraison sous 48h-72h via Finexs, Buca, Touristique Express avec suivi et alerte par SMS.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RETURN SIMULATOR (SIMULATEUR DE RETOURS) */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Return Eligibility Simulator' : 'Simulateur d\'Éligibilité aux Retours'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'Check in real time if your yarn ball or accessory meets Cameroon Law N° 2011/012 return criteria' : 'Vérifiez en temps réel si votre pelote ou outil respecte les critères de la Loi Camerounaise N° 2011/012'}
                  </p>
                </div>
              </div>

              {/* Simulator Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                
                {/* Field 1: Item Type */}
                <div className="space-y-2">
                  <label className="font-bold text-primary dark:text-white block">
                    {isEn ? '1. State and Type of the item :' : '1. État et Type de l\'article :'}
                  </label>
                  <select
                    value={simItemType}
                    onChange={(e) => setSimItemType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none font-medium"
                  >
                    <option value="yarn_intact">
                      {isEn ? 'Yarn Ball - Intact (Unopened with original label)' : 'Pelote de Laine - Intacte (Non tricotée, étiquette présente)'}
                    </option>
                    <option value="yarn_opened">
                      {isEn ? 'Yarn Ball - Opened (Cut, knitted or label missing)' : 'Pelote de Laine - Entamée (Coupée, dévidée ou sans bague)'}
                    </option>
                    <option value="custom_item">
                      {isEn ? 'Bespoke / Custom Item (Custom made or dyed on-demand)' : 'Article Personnalisé / Confection Sur-Mesure'}
                    </option>
                    <option value="accessory_sealed">
                      {isEn ? 'Accessory / Tool - Sealed (Original packaging unbroken)' : 'Accessoire de Mercerie - Sous emballage d\'origine scellé'}
                    </option>
                    <option value="accessory_opened">
                      {isEn ? 'Accessory / Tool - Opened (Unsealed or package torn)' : 'Accessoire de Mercerie - Déscellé ou emballage déchiré'}
                    </option>
                  </select>
                </div>

                {/* Field 2: Days since delivery */}
                <div className="space-y-2">
                  <label className="font-bold text-primary dark:text-white block">
                    {isEn ? '2. Days elapsed since delivery :' : '2. Nombre de jours écoulés depuis la livraison :'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={simDaysSinceDelivery}
                      onChange={(e) => setSimDaysSinceDelivery(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <span className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shrink-0">
                      {simDaysSinceDelivery} {isEn ? `day${simDaysSinceDelivery > 1 ? 's' : ''}` : `jour${simDaysSinceDelivery > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-primary/60 dark:text-white/60">
                    {isEn ? 'Cameroonian legal period: 7 calendar days.' : 'Délai légal camerounais : 7 jours calendaires à date de réception.'}
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
                  <span className="font-bold block">{isEn ? 'Legal Advice :' : 'Recommandation légale :'}</span>
                  <p>{simulationResult.action}</p>
                </div>
              </div>

              {/* 3 Steps summary */}
              <div className="pt-4 border-t border-primary/10 dark:border-white/10">
                <h3 className="text-sm font-bold text-primary dark:text-white mb-3">
                  {isEn ? 'How to proceed with your return in 3 steps:' : 'Marche à suivre pour un retour en 3 étapes :'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">{isEn ? '1. Notification' : '1. Signalement'}</strong>
                    <span className="text-primary/70 dark:text-white/70">
                      {isEn ? 'Fill out the withdrawal form (next tab) and send it via WhatsApp or Email.' : 'Remplissez le formulaire de rétractation (onglet suivant) et transmettez-le par WhatsApp ou Email.'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">{isEn ? '2. Shipment' : '2. Expédition'}</strong>
                    <span className="text-primary/70 dark:text-white/70">
                      {isEn ? 'Carefully pack your pristine yarn balls and drop them off with our courier or transit agency.' : 'Emballez soigneusement vos pelotes intactes et déposez-les auprès de notre coursier ou en agence relais.'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1">
                    <strong className="block text-primary dark:text-white font-bold">{isEn ? '3. Refund' : '3. Remboursement'}</strong>
                    <span className="text-primary/70 dark:text-white/70">
                      {isEn ? 'Validation within 24h of receipt and instant Mobile Money transfer to your account.' : 'Validation du colis sous 24h et transfert immédiat sur votre compte MTN MoMo ou Orange Money.'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: WITHDRAWAL FORM GENERATOR (FORMULAIRE DE RÉTRACTATION) */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Official Withdrawal Form Generator' : 'Générateur Officiel de Formulaire de Rétractation'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn 
                      ? 'Legal withdrawal model compliant with Law N° 2011/012 (Cameroon) for your returns' 
                      : 'Modèle légal conforme à la Loi N° 2011/012 (Cameroun) pour vos retours et remboursements'}
                  </p>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">{isEn ? 'Full Name :' : 'Nom & Prénom complet :'}</label>
                  <input
                    type="text"
                    placeholder="Ex: Landry Moutongo"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">{isEn ? 'Order Number :' : 'Numéro de Commande :'}</label>
                  <input
                    type="text"
                    placeholder="Ex: LD-2026-8941"
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">{isEn ? 'Date of delivery receipt :' : 'Date de réception du colis :'}</label>
                  <input
                    type="date"
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-primary dark:text-white">{isEn ? 'Preferred Refund Mode :' : 'Mode de remboursement préféré :'}</label>
                  <select
                    value={formRefundMethod}
                    onChange={(e) => setFormRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:ring-1 focus:ring-accent outline-none font-medium"
                  >
                    <option value="momo">MTN Mobile Money (*126#)</option>
                    <option value="om">Orange Money Cameroun (*150#)</option>
                    <option value="credit">{isEn ? 'Immediate Store Credit (+5% bonus)' : "Avoir / Bon d'achat immédiat (+5% de bonus)"}</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-primary dark:text-white">{isEn ? 'Returned Items & Mobile Money Phone Number :' : 'Articles retournés & Numéro de téléphone Mobile Money :'}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={isEn ? "e.g., 4 Camel Merino wool balls (labels intact)" : "Ex: 4 pelotes Mérinos Camel (Bague intacte)"}
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
                    {isEn ? 'Generated contract text ready to send :' : 'Texte contractuel généré prêt à l\'envoi :'}
                  </span>
                  <button
                    onClick={handleCopyForm}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-bold"
                  >
                    {copiedForm ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copiedForm ? (isEn ? 'Copied!' : 'Copié !') : (isEn ? 'Copy Text' : 'Copier le texte')}
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
                  {copiedForm 
                    ? (isEn ? 'Copied to clipboard' : 'Copié dans le presse-papier') 
                    : (isEn ? 'Copy for Email' : 'Copier pour Email')}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendWhatsApp}
                  className="gap-2 text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white border-transparent"
                >
                  <MessageSquare size={14} />
                  {isEn ? 'Send via WhatsApp to Support' : 'Transmettre via WhatsApp au Support'}
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: FAQ JURIDIQUE & PRATIQUE */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-start gap-3 text-xs sm:text-sm text-primary/90 dark:text-white/90">
              <HelpCircle size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong>{isEn ? 'Practical Legal FAQ:' : 'Questions Fréquentes Juridiques & Pratiques :'}</strong> {isEn ? 'Clear answers to your common questions regarding orders, dye lots and returns.' : 'Retrouvez ici les réponses transparentes aux questions contractuelles les plus courantes.'}
              </div>
            </div>

            {/* FAQ Item 1 */}
            <div className="bg-white dark:bg-[#181C18] rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq('faq-1')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-primary dark:text-white hover:bg-primary/5 transition-colors"
              >
                <span>{isEn ? '1. What should I do if a yarn ball has a factory knot?' : '1. Que faire si une pelote présente un nœud de raccordement d\'usine ?'}</span>
                {expandedFaq['faq-1'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-1'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    {isEn 
                      ? 'In high-end spinning mills, the presence of 1 or 2 small knots per 100g yarn ball is a normal industrial textile tolerance resulting from connecting spinning lines.'
                      : "Dans les filatures de laine haut de gamme, la présence de 1 à 2 nœuds discrets par pelote de 100g est une tolérance industrielle textile normale issue du raccordement des mèches de filage."}
                  </p>
                  <p>
                    {isEn
                      ? 'However, if a ball has abnormal breaks or clear spinning issues, our quality guarantee applies: send us a picture, and we will replace it free of charge.'
                      : "Toutefois, si une pelote présente des ruptures répétées anormales ou un défaut de torsion évident, notre garantie de conformité s'applique : envoyez-nous une photo et nous vous remplaçons la pelote sans frais."}
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
                <span>{isEn ? '2. Can I reserve wool balls from a specific dye lot?' : '2. Puis-je faire réserver des pelotes d\'un bain de teinture spécifique ?'}</span>
                {expandedFaq['faq-2'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFaq['faq-2'] && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed border-t border-primary/5 dark:border-white/5 space-y-2">
                  <p>
                    {isEn
                      ? 'Yes! If you have a large knitting project and want to ensure an identical dyeing batch (Dye Lot), contact us. We will put aside your identical dye lot balls for up to 48 hours.'
                      : "Oui ! Si vous avez un gros projet de tricot (châle, pull ou plaid) et souhaitez être certain d'avoir un lot complet identique, vous pouvez nous contacter directement avant commande. Nous réservons vos pelotes sous le même numéro de bain (Dye Lot) pendant 48 heures ouvrées."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: LOIS CAMEROUNAISES & OHADA */}
        {activeTab === 'law' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Scale size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Governing Cameroonian & OHADA Laws' : 'Textes Législatifs et Réglementaires Applicables'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'Applicable legal framework of the Republic of Cameroon & regional OHADA zone' : 'Cadre juridique de la République du Cameroun et de l\'espace OHADA'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-primary/80 dark:text-white/80">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">
                    {isEn ? '1. Law N° 2010/021 of Dec 21, 2010 on Electronic Commerce in Cameroon' : '1. Loi N° 2010/021 du 21 décembre 2010 régissant le commerce électronique au Cameroun'}
                  </h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    {isEn 
                      ? 'Defines rules for contracts signed electronically, liabilities of online sellers, and prior information requirements.'
                      : 'Fixe les conditions de validité des contrats conclus par voie électronique, la responsabilité des prestataires et les obligations d\'information précontractuelle.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                  <h3 className="font-bold text-primary dark:text-white text-sm">
                    {isEn ? '2. Law N° 2011/012 of May 6, 2011 on Consumer Protection in Cameroon' : '2. Loi N° 2011/012 du 6 mai 2011 portant protection du consommateur au Cameroun'}
                  </h3>
                  <p className="text-xs text-primary/70 dark:text-white/70">
                    {isEn 
                      ? 'Guarantees fundamental consumer rights, product safety, a 7-day withdrawal period, and fair trade practices.'
                      : 'Garantit les droits fondamentaux des consommateurs, la sécurité des produits vendus, le droit de rétractation et la loyauté des transactions commerciales.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Contact Banner */}
        <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
          <div>
            <h4 className="font-bold text-sm text-primary dark:text-white">
              {isEn ? 'Any question about your rights, a return or an order?' : 'Une question sur vos droits, un retour ou une commande ?'}
            </h4>
            <p className="text-xs text-primary/70 dark:text-white/70">
              {isEn ? 'Our sales and legal support team is at your direct disposal to assist you.' : 'Notre équipe commerciale et juridique est à votre disposition pour vous accompagner.'}
            </p>
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
                {isEn ? 'Contact Customer Service' : 'Contacter le Service Client'}
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TermsView;

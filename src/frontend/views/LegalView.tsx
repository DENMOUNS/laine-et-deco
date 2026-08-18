import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Scale,
  Building2,
  Server,
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LegalViewProps {
  onNavigate?: (view: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('editor');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'editor', title: '1. Éditeur de la Plateforme', icon: Building2 },
    { id: 'direction', title: '2. Direction de la Publication', icon: FileText },
    { id: 'hosting', title: '3. Hébergement & Infrastructure', icon: Server },
    { id: 'ip', title: '4. Propriété Intellectuelle', icon: Scale },
    { id: 'privacy', title: '5. Données Personnelles', icon: Lock },
    { id: 'cookies', title: '6. Cookies & Traceurs', icon: Cookie },
    { id: 'liability', title: '7. Responsabilité & Disponibilité', icon: AlertCircle },
    { id: 'ecommerce', title: '8. Commerce Électronique & Tarifs', icon: CreditCard },
    { id: 'disputes', title: '9. Droit Applicable & Litiges', icon: ShieldCheck },
    { id: 'contact', title: '10. Contact & Assistance', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-[#0E100E] pb-24 text-primary dark:text-[#E8EBE7] transition-colors">
      {/* Header Banner */}
      <div className="bg-[#2D3E31] dark:bg-[#141814] text-white pt-24 pb-16 px-4 rounded-b-[2.5rem] md:rounded-b-[3.5rem] relative overflow-hidden shadow-lg border-b border-white/10">
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
            Cadre Réglementaire & Juridique
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight"
          >
            Mentions Légales
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-6"
          >
            Transparence, conformité et sécurité relatives à l'utilisation et aux services du site <strong>Laine et Déco</strong>.
          </motion.p>

          <div className="flex items-center justify-center gap-4 text-xs text-white/70">
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Version en vigueur : Année 2026</span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Applicable à tous les visiteurs & acheteurs</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Sidebar Navigation (Desktop) */}
          <aside className="lg:col-span-4 xl:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-white dark:bg-[#181C18] rounded-3xl p-5 shadow-xl border border-primary/10 dark:border-white/10 space-y-4 backdrop-blur-xl">
              <div className="px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Sommaire</h3>
                <p className="text-xs text-primary/60 dark:text-white/60">Accès direct aux chapitres</p>
              </div>

              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Rechercher une clause..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {sections
                  .filter((s) => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                          isActive
                            ? 'bg-accent text-white shadow-sm font-semibold'
                            : 'text-primary/80 dark:text-white/80 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-accent'
                        }`}
                      >
                        <Icon size={14} className={isActive ? 'text-white' : 'text-accent'} />
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
              </nav>

              <div className="pt-3 border-t border-primary/10 dark:border-white/10">
                <div className="bg-primary/5 dark:bg-white/5 p-3 rounded-2xl text-[11px] space-y-1.5">
                  <p className="font-semibold text-primary dark:text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Site certifié conforme
                  </p>
                  <p className="text-primary/70 dark:text-white/70 leading-normal">
                    Conforme aux standards de commerce en ligne et de protection des données.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Core Legal Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-8">
            
            {/* Quick Pills Navigation (Mobile) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#181C18] border border-primary/10 dark:border-white/10 text-xs font-semibold whitespace-nowrap shadow-sm active:scale-95"
                >
                  {sec.title.split(' ')[1] || sec.title}
                </button>
              ))}
            </div>

            {/* Section 1: Éditeur du site */}
            <div
              id="editor"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    1. Éditeur de la Plateforme
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Identité juridique de la structure exploitante</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  Le site internet et l'application web <strong>Laine et Déco</strong> (accessible à l'adresse officielle de la marque) sont édités et exploités par l'entreprise artisanale <strong>Laine & Déco</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Dénomination commerciale :</span>
                    <span>Laine et Déco (Laine & Déco)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Secteur d'activité :</span>
                    <span>Mercerie créative, pelotes de laine noble, crochets, aiguilles de précision et accessoires d'artisanat</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Siège social :</span>
                    <span>Douala, Région du Littoral, Cameroun</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Fondateurs & Direction :</span>
                    <span>Laine & Déco</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Email de contact officiel :</span>
                    <a href="mailto:contact@laineetdeco.cm" className="text-accent underline font-medium">contact@laineetdeco.cm</a>
                  </div>
                  <div>
                    <span className="font-semibold text-primary dark:text-white block mb-1">Service Client & WhatsApp :</span>
                    <span className="font-mono font-medium">+237 690 00 00 00 / WhatsApp Pro</span>
                  </div>
                </div>

                <p>
                  L'entreprise a pour vocation la promotion des arts du fil, la confection artisanale, la commercialisation de pelotes de haute qualité, de crochets, d'aiguilles de précision, d'accessoires de tricot ainsi que d'artisanat fait main authentique.
                </p>
              </div>
            </div>

            {/* Section 2: Direction de la publication */}
            <div
              id="direction"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    2. Direction de la Publication & Rédaction
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Responsables éditoriaux et contenus</p>
                </div>
              </div>

              <div className="space-y-3 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  La responsabilité de la publication, de la ligne éditoriale, des articles de blog, des fiches conseils tricot et des guides d'entretien est assurée conjointement par :
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                  <li><strong>Directeurs de la publication :</strong> L'équipe de Laine & Déco.</li>
                  <li><strong>Pôle Rédaction & Contenu :</strong> L’équipe créative Laine et Déco.</li>
                  <li><strong>Contact éditorial :</strong> Pour toute question relative aux contenus diffusés, contactez le pôle éditorial via <a href="mailto:redaction@laineetdeco.cm" className="text-accent underline">redaction@laineetdeco.cm</a> ou le formulaire de contact.</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Hébergement & Infrastructure */}
            <div
              id="hosting"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <Server size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    3. Hébergement & Infrastructure Technique
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Sécurité des serveurs et hébergeurs agréés</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  L'infrastructure technique, l'hébergement web, la base de données temps réel et les services d'authentification sont opérés sur des infrastructures cloud de classe mondiale :
                </p>

                <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary dark:text-white min-w-[140px]">Hébergeur Cloud :</span>
                    <span>Google Cloud Platform & Firebase Hosting (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary dark:text-white min-w-[140px]">Base de données :</span>
                    <span>Google Firestore Database avec réplication automatique et sauvegardes redondantes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary dark:text-white min-w-[140px]">Sécurité & Chiffrement :</span>
                    <span>Certificat SSL/TLS 256 bits (HTTPS) actif en permanence sur l’ensemble du domaine.</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70">
                  Les données hébergées bénéficient des normes de sécurité internationales les plus strictes (ISO/IEC 27001, SOC 1/2/3).
                </p>
              </div>
            </div>

            {/* Section 4: Propriété intellectuelle */}
            <div
              id="ip"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <Scale size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    4. Propriété Intellectuelle & Droits Réservés
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Protection de la marque, des photos et des outils</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  L’ensemble des éléments constituant le site <strong>Laine et Déco</strong> — notamment mais non exclusivement : les textes, chartes graphiques, logos, marques déposées, iconographies, photographies de pelotes et d'articles d'artisanat ou mercerie, vidéos, architectures logicielles, algorithmes, ainsi que les outils interactifs exclusifs (tels que le <em>Compagnon Tricot</em>, le <em>Générateur de Patrons</em>, le <em>Calculateur de Volume</em> et le <em>Configurateur</em>) — sont la propriété exclusive de <strong>Laine & Déco</strong> ou font l’objet d’une licence d’exploitation régulière.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
                  <strong>Interdiction stricte :</strong> Toute reproduction, représentation, modification, publication, adaptation totale ou partielle de l'un quelconque de ces éléments, quel que soit le moyen ou le procédé utilisé, est formellement interdite sans autorisation écrite préalable.
                </div>
              </div>
            </div>

            {/* Section 5: Données personnelles & RGPD */}
            <div
              id="privacy"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <Lock size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    5. Données Personnelles & Confidentialité
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Respect de la vie privée et exercice de vos droits</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  Dans le cadre de ses activités commerciales et de ses services numériques, <strong>Laine et Déco</strong> met en œuvre des traitements de données à caractère personnel dans le respect strict des réglementations en vigueur et des principes fondamentaux de protection de la vie privée :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm my-3">
                  <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                    <span className="font-bold text-primary dark:text-white block">Données Collectées :</span>
                    <p className="text-xs text-primary/70 dark:text-white/70">Nom, prénom, adresse de livraison, numéro de téléphone (pour le transporteur), adresse email et historique de commande.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-1.5">
                    <span className="font-bold text-primary dark:text-white block">Finalités du Traitement :</span>
                    <p className="text-xs text-primary/70 dark:text-white/70">Préparation et expédition des commandes, émission des reçus/factures, support client et personnalisation de l'espace client.</p>
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-2 text-sm pl-2">
                  <li><strong>Non-transmission :</strong> Aucune donnée personnelle n'est vendue, louée ou cédée à des tiers à des fins publicitaires.</li>
                  <li><strong>Sécurité des transactions :</strong> Vos coordonnées bancaires et numéros Mobile Money sont traités directement par nos passerelles de paiement certifiées et ne sont jamais stockés sur nos serveurs.</li>
                  <li><strong>Vos droits :</strong> Vous disposez à tout moment d'un droit d'accès, de rectification, de portabilité et de suppression définitive de vos données personnelles sur simple demande via notre formulaire de contact ou par email à <a href="mailto:contact@laineetdeco.cm" className="text-accent underline font-semibold">contact@laineetdeco.cm</a>.</li>
                </ul>
              </div>
            </div>

            {/* Section 6: Cookies */}
            <div
              id="cookies"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <Cookie size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    6. Cookies & Technologies de Stockage Local
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Gestion du panier, thème et préférences</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  Pour assurer une expérience fluide et préserver vos articles sélectionnés, le site utilise des cookies et le stockage local sécurisé (<em>localStorage</em>) :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
                    <span className="font-bold block text-primary dark:text-white mb-1">Cookies Fonctionnels</span>
                    <span>Mémorisation du panier d'achat, de la liste de souhaits et de la session utilisateur.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
                    <span className="font-bold block text-primary dark:text-white mb-1">Préférences d'Affichage</span>
                    <span>Mémorisation du mode sombre / clair et des filtres de catalogue choisis.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
                    <span className="font-bold block text-primary dark:text-white mb-1">Zéro Pistage Intrusif</span>
                    <span>Aucun cookie tiers intrusif ni reciblage publicitaire externe abusif.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Responsabilité & Disponibilité */}
            <div
              id="liability"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    7. Limites de Responsabilité & Spécificités Artisanales
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Nature des produits et continuité de service</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  <strong>Laine et Déco</strong> s’efforce de fournir des informations aussi précises que possible concernant la composition des laines, les grammages, les métrages et les dimensions des crochets, aiguilles et accessoires d'artisanat.
                </p>
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-xs sm:text-sm space-y-2">
                  <p>
                    <strong>Nuances de bains & Artisanat :</strong> Les fibres textiles naturelles et les pelotes teintées peuvent présenter de légères variations de nuance d'un bain à un autre ou selon l'étalonnage des écrans. Ces particularités font partie intégrante du charme et de l'authenticité artisanale.
                  </p>
                  <p>
                    <strong>Disponibilité :</strong> Le site est accessible 24h/24 et 7j/7, sous réserve d’éventuelles interruptions pour maintenance programmée ou cas de force majeure indépendants de notre volonté.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 8: Commerce Électronique & Tarifs */}
            <div
              id="ecommerce"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    8. Commerce Électronique, Monnaie & Moyens de Paiement
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Conditions tarifaires et sécurité financière</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  Les prix indiqués sur l'ensemble de notre catalogue sont exprimés en <strong>Francs CFA (FCFA / XAF)</strong>, toutes taxes comprises (TTC), hors frais de livraison applicables selon la zone géographique de destination (Douala, Yaoundé, et autres villes du Cameroun ou de la sous-région).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
                    <span className="font-bold block text-primary dark:text-white mb-1">Moyens de Paiement Acceptés :</span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-primary/70 dark:text-white/70">
                      <li>Mobile Money (MTN MoMo, Orange Money)</li>
                      <li>Cartes Bancaires sécurisées (Visa / Mastercard)</li>
                      <li>Paiement en espèces à la livraison (selon éligibilité)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10">
                    <span className="font-bold block text-primary dark:text-white mb-1">Facturation & Traçabilité :</span>
                    <p className="text-xs text-primary/70 dark:text-white/70">
                      Chaque commande validée génère un récapitulatif numérique téléchargeable depuis l'espace client avec numéro de suivi unique.
                    </p>
                  </div>
                </div>

                {onNavigate && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('terms')}
                      className="gap-2 text-xs"
                    >
                      Consulter nos Conditions Générales de Vente (CGV)
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 9: Droit applicable & Litiges */}
            <div
              id="disputes"
              className="bg-white dark:bg-[#181C18] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    9. Droit Applicable & Règlement des Différends
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Juridiction compétente et médiation</p>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80">
                <p>
                  Les présentes mentions légales ainsi que l'ensemble des opérations contractuelles conclues sur le site sont régies par le droit camerounais et les règles internationales régissant le commerce en ligne.
                </p>
                <p>
                  En cas de réclamation ou de désaccord, les parties s'engagent à privilégier une <strong>résolution amiable</strong> en contactant en priorité notre service de médiation client. À défaut d’accord amiable, les tribunaux compétents du ressort du siège social de l'éditeur seront seuls compétents.
                </p>
              </div>
            </div>

            {/* Section 10: Contact & Assistance */}
            <div
              id="contact"
              className="bg-gradient-to-br from-primary/10 via-card to-accent/10 dark:from-white/5 dark:to-accent/5 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-primary/15 dark:border-white/10 space-y-6 scroll-mt-28"
            >
              <div className="flex items-center gap-3 border-b border-primary/10 dark:border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-md">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary dark:text-white">
                    10. Nous Contacter & Assistance Juridique
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">Nos équipes sont à votre disposition</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#181C18] border border-primary/10 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <Mail size={16} />
                  </div>
                  <span className="font-semibold text-xs text-primary/70 dark:text-white/70 mb-1">Courriel</span>
                  <a href="mailto:contact@laineetdeco.cm" className="text-accent text-xs font-bold hover:underline">contact@laineetdeco.cm</a>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#181C18] border border-primary/10 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <MapPin size={16} />
                  </div>
                  <span className="font-semibold text-xs text-primary/70 dark:text-white/70 mb-1">Localisation</span>
                  <span className="text-xs font-bold text-primary dark:text-white">Douala, Cameroun</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#181C18] border border-primary/10 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <Phone size={16} />
                  </div>
                  <span className="font-semibold text-xs text-primary/70 dark:text-white/70 mb-1">Support Dédié</span>
                  <span className="text-xs font-bold text-primary dark:text-white">Lun - Sam : 8h30 - 18h30</span>
                </div>
              </div>

              {onNavigate && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={() => onNavigate('contact')}
                    className="gap-2 text-xs font-bold px-6 py-3"
                  >
                    <Mail size={16} />
                    Accéder au Formulaire de Contact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('faq')}
                    className="gap-2 text-xs font-bold px-6 py-3"
                  >
                    Consulter la FAQ
                  </Button>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalView;

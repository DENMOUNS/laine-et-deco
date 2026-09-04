import React, { useState } from 'react';
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
} from 'lucide-react';
import { LegalHeader } from './legal/LegalHeader';
import { LegalSidebar, LegalSectionMeta } from './legal/LegalSidebar';
import { LegalSections } from './legal/LegalSections';

interface LegalViewProps {
  onNavigate?: (view: string) => void;
}

const SECTIONS: LegalSectionMeta[] = [
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

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-[#0E100E] pb-24 text-primary dark:text-[#E8EBE7] transition-colors">
      <LegalHeader onNavigate={onNavigate} />

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <LegalSidebar
            sections={SECTIONS}
            activeSection={activeSection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectSection={scrollToSection}
          />

          <LegalSections
            sections={SECTIONS}
            onScrollToSection={scrollToSection}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};

export default LegalView;

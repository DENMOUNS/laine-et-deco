import { create } from 'zustand';

export type Language = 'fr' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem('app_language') as Language | null;
  if (saved === 'fr' || saved === 'en') {
    return saved;
  }
  // Auto-detect browser language if English
  const navLang = navigator.language?.toLowerCase() || '';
  if (navLang.startsWith('en')) {
    return 'en';
  }
  return 'fr';
};

const initialLanguage = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLanguage,
  setLanguage: (lang: Language) => {
    localStorage.setItem('app_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },
  toggleLanguage: () => {
    set((state) => {
      const next: Language = state.language === 'fr' ? 'en' : 'fr';
      localStorage.setItem('app_language', next);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
      return { language: next };
    });
  },
}));

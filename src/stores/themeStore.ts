import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  syncWithSystem: () => void;
}

// Détecte le thème du système du téléphone (Samsung, Pixel, Tecno, iPhone, etc.)
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

// Initialise le thème : s'adapte en priorité au thème du téléphone
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  // S'adapte au mode clair/sombre de l'OS du téléphone par défaut
  return getSystemTheme();
};

// Applique la classe .dark et met à jour les balises système (status bar, meta theme-color)
const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  
  // Mettre à jour la meta theme-color pour synchroniser la barre de statut sur Android et iOS
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#141814' : '#F9F7F2');
  }
};

// Appliquer immédiatement le thème initial
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
    return { theme: nextTheme };
  }),
  setTheme: (theme) => set(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    return { theme };
  }),
  syncWithSystem: () => set(() => {
    localStorage.removeItem('theme');
    const sysTheme = getSystemTheme();
    applyTheme(sysTheme);
    return { theme: sysTheme };
  })
}));

// Écouteur en temps réel des changements de thème du téléphone
if (typeof window !== 'undefined') {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Si l'utilisateur n'a pas explicitement forcé un thème dans son stockage local
      const hasSavedTheme = localStorage.getItem('theme');
      if (!hasSavedTheme) {
        const newTheme: Theme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setTheme(newTheme);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleThemeChange);
    }
  } catch (e) {
    // Ignorer les erreurs d'environnement sans matchMedia
  }
}

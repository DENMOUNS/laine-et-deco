/**
 * Utilitaire de retour haptique doux pour mobile
 * Utilise la Web Vibration API (navigator.vibrate) avec vérification de compatibilité
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' | 'selection' = 'light') => {
  if (typeof window === 'undefined' || !navigator || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        // Micro-impulsion ultra-douce pour les clics d'onglets, favoris, etc.
        navigator.vibrate(12);
        break;
      case 'medium':
        // Retour modéré pour l'incrémentation d'un compteur ou validation
        navigator.vibrate(25);
        break;
      case 'success':
        // Double pulsation douce pour un ajout au panier ou commande réussie
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        // Impulsion de signalement
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Les navigateurs bloquant la vibration ne lèvent pas d'erreur critique
  }
};

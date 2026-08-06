import React from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { initFirebase } from '../../backend/firebase';
import { serverTimestamp, setDoc, doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';

interface AuthViewProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSuccessRedirect = () => {
    const returnToCheckout = sessionStorage.getItem('returnToCheckout');
    if (returnToCheckout === 'true') {
      sessionStorage.removeItem('returnToCheckout');
      onNavigate('checkout');
    } else {
      onNavigate('home');
    }
  };

  const syncGoogleUserProfile = async (firebaseDb: any, user: any) => {
    const userDocRef = doc(firebaseDb, 'user', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      const emailQuery = query(collection(firebaseDb, 'user'), where('email', '==', user.email));
      const emailSnap = await getDocs(emailQuery);

      if (!emailSnap.empty) {
        const existingDoc = emailSnap.docs[0];
        await setDoc(existingDoc.ref, {
          ...existingDoc.data(),
          uid: user.uid,
          name: existingDoc.data()?.name || user.displayName || 'Utilisateur',
          email: user.email,
          profileImage: existingDoc.data()?.profileImage || user.photoURL || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        const referralCode = sessionStorage.getItem('referralCode');
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || 'Utilisateur',
          email: user.email,
          profileImage: user.photoURL || null,
          role: 'customer',
          points: 0,
          orders: 0,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
          referredBy: referralCode || null,
          createdAt: serverTimestamp()
        });
      }
      return;
    }

    const existingData = userSnap.data();
    const updates: any = {};
    if (user.photoURL && existingData?.profileImage !== user.photoURL) {
      updates.profileImage = user.photoURL;
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(userDocRef, updates);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const { auth: firebaseAuth, db: firebaseDb } = initFirebase();
    if (!firebaseAuth || !firebaseDb) {
      toast.error("Firebase n'est pas configuré correctement.");
      setIsSubmitting(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider, browserPopupRedirectResolver);
      const user = result.user;
      
      try {
        await syncGoogleUserProfile(firebaseDb, user);
      } catch {
        // La connexion reste valide même si la sync échoue
      }
      
      toast.success('Connexion réussie !');
      handleSuccessRedirect();
    } catch (error: any) {
      let errorMessage = "Erreur lors de la connexion avec Google.";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Domaine non autorisé. Ajoutez ${window.location.hostname} aux domaines autorisés dans la console Firebase.`;
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Le popup a été bloqué. Veuillez autoriser les popups pour ce site.";
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Connexion annulée. Veuillez réessayer.';
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      {isSubmitting && <Loader fullScreen text="Connexion en cours..." />}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 rounded-2xl mb-6 border border-primary/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor" className="text-accent"/>
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-primary mb-2">Bienvenue</h1>
          <p className="text-primary/60 text-sm leading-relaxed max-w-xs mx-auto">
            Accédez à votre espace client Laine &amp; Déco en un clic avec votre compte Google.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-primary/5 p-8 space-y-6">
          
          {/* Google Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-slate-200 hover:border-primary/30 rounded-2xl font-semibold text-slate-700 hover:text-primary transition-all duration-200 shadow-sm hover:shadow-md group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="group-hover:scale-110 transition-transform duration-200">
              <GoogleIcon />
            </span>
            <span>Continuer avec Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">Connexion sécurisée</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔒', label: 'Chiffré SSL' },
              { icon: '🛡️', label: 'Données protégées' },
              { icon: '⚡', label: 'Connexion rapide' },
            ].map((badge) => (
              <div key={badge.label} className="bg-slate-50 rounded-xl p-3">
                <div className="text-lg mb-1">{badge.icon}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-primary/50 leading-relaxed mt-6 px-4">
          En vous connectant, vous acceptez nos{' '}
          <button
            type="button"
            onClick={() => onNavigate('terms')}
            className="underline hover:text-primary transition-colors"
          >
            Conditions d'utilisation
          </button>{' '}
          et notre{' '}
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="underline hover:text-primary transition-colors"
          >
            Politique de confidentialité
          </button>.
        </p>
      </motion.div>
    </div>
  );
};

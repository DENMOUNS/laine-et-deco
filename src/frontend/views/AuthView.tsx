import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Phone, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  updateProfile
} from 'firebase/auth';
import { initFirebase } from '../../backend/firebase';
import { serverTimestamp, setDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const authSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court').optional(),
  email: z.string().email('Email invalide').or(z.string().min(8, 'Numéro de téléphone invalide')),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

interface AuthViewProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hpValue, setHpValue] = useState(''); // Honeypot value

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(authSchema)
  });

  React.useEffect(() => {
    if (mode === 'reset' && loginMethod !== 'email') {
      setLoginMethod('email');
    }
  }, [mode, loginMethod]);

  const handleSuccessRedirect = () => {
    const returnToCheckout = sessionStorage.getItem('returnToCheckout');
    if (returnToCheckout === 'true') {
      sessionStorage.removeItem('returnToCheckout');
      onNavigate('checkout');
    } else {
      onNavigate('home');
    }
  };

  const onSubmit = async (data: any) => {
    // Check honeypot
    if (hpValue) {
      return;
    }
    
    setIsSubmitting(true);
    const { auth: firebaseAuth, db: firebaseDb } = initFirebase();
    if (!firebaseAuth) {
      toast.error("Firebase n'est pas configuré correctement.");
      setIsSubmitting(false);
      return;
    }
    if (mode === 'signup' && !firebaseDb) {
      toast.error("Firebase n'est pas configuré correctement.");
      setIsSubmitting(false);
      return;
    }
    if (mode === 'reset' && (!data.email || !data.email.includes('@'))) {
      toast.error('Veuillez entrer une adresse email valide pour la réinitialisation.');
      setIsSubmitting(false);
      return;
    }
    if ((mode === 'login' || mode === 'signup') && !data.password) {
      toast.error('Veuillez saisir un mot de passe valide.');
      setIsSubmitting(false);
      return;
    }
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const user = userCredential.user;

        // Verify/create user document in Firestore after login
        if (firebaseDb && user.uid && user.email) {
          const userDocRef = doc(firebaseDb, 'user', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
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
              await setDoc(userDocRef, {
                uid: user.uid,
                name: user.displayName || 'Utilisateur',
                email: user.email,
                role: 'customer',
                points: 0,
                orders: 0,
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active',
                createdAt: serverTimestamp()
              });
            }
          }
        }

        toast.success('Connexion réussie !');
        handleSuccessRedirect();
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const user = userCredential.user;
        if (data.name) {
          await updateProfile(user, { displayName: data.name });
        }
        
        // Create user document in Firestore with customer role
        const referralCode = sessionStorage.getItem('referralCode');
        await setDoc(doc(firebaseDb!, 'user', user.uid), {
          uid: user.uid,
          name: data.name || user.displayName || 'Utilisateur',
          email: user.email,
          role: 'customer',
          points: 0,
          orders: 0,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
          referredBy: referralCode || null,
          createdAt: serverTimestamp()
        });
        
        toast.success('Compte créé avec succès !');
        handleSuccessRedirect();
      } else if (mode === 'reset') {
        const { auth: firebaseAuth } = initFirebase();
        if (!firebaseAuth) {
          toast.error("Firebase n'est pas configuré correctement.");
          return;
        }
        await sendPasswordResetEmail(firebaseAuth, data.email);
        toast.success('Lien de réinitialisation envoyé !');
        setMode('login');
      }
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de l'authentification.";
      if (error.code === 'auth/user-not-found') errorMessage = "Utilisateur non trouvé.";
      if (error.code === 'auth/wrong-password') errorMessage = "Mot de passe incorrect.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Cet email est déjà utilisé.";
      if (error.code === 'auth/invalid-email' || error.code === 'auth/argument-error') errorMessage = "Email invalide ou format incorrect.";
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
      
      // Check if user document exists, if not create it
      const userDocRef = doc(firebaseDb!, 'user', user.uid);
      const { getDoc, query, collection, where, getDocs, updateDoc } = await import('firebase/firestore');
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
      } else {
        // Update profile metadata without changing the role managed in Firestore.
        const existingData = userSnap.data();
        let updates: any = {};
        if (user.photoURL && existingData?.profileImage !== user.photoURL) {
          updates.profileImage = user.photoURL;
        }
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = serverTimestamp();
          await updateDoc(userDocRef, updates);
        }
      }
      
      toast.success('Connexion Google réussie !');
      handleSuccessRedirect();
    } catch (error: any) {
      let errorMessage = "";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Domaine non autorisé. Veuillez ajouter ${window.location.hostname} aux domaines autorisés dans votre console Firebase (Authentification > Paramètres).`;
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Le popup a été bloqué. Veuillez autoriser les popups ou ouvrir l'application dans un nouvel onglet.";
      } else if (error.code === 'auth/argument-error') {
        errorMessage = 'Erreur Google : impossible d’ouvrir le popup. Essayez de recharger la page ou vérifiez que les popups sont autorisés.';
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Connexion Google annulée. Veuillez réessayer.';
      } else {
        errorMessage = "Erreur lors de la connexion avec Google.";
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isSubmitting && <Loader fullScreen text="Patientez un instant..." />}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2rem] shadow-xl border border-primary/5"
      >
        <div className="text-center">
          <h2 className="text-4xl font-serif text-primary mb-2">
            {mode === 'login' && 'Bon retour !'}
            {mode === 'signup' && 'Bienvenue'}
            {mode === 'reset' && 'Mot de passe oublié'}
          </h2>
          <p className="text-primary/70 text-sm">
            {mode === 'login' && 'Connectez-vous pour accéder à votre compte.'}
            {mode === 'signup' && 'Créez votre compte en quelques secondes.'}
            {mode === 'reset' && 'Entrez votre email pour réinitialiser votre mot de passe.'}
          </p>
        </div>

        {mode !== 'reset' ? (
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${loginMethod === 'email' ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:text-primary'}`}
            >
              Email
            </button>
            <button 
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${loginMethod === 'google' ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:text-primary'}`}
            >
              Google
            </button>
          </div>
        ) : (
          <div className="text-sm text-center text-primary/70 mb-8">Réinitialisation de mot de passe par email uniquement.</div>
        )}

        {loginMethod === 'google' ? (
          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-6 bg-white border border-primary/10 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
            <p className="text-center text-xs text-primary/70 leading-relaxed">
              En continuant avec Google, vous acceptez nos <button onClick={() => onNavigate('terms')} className="underline">Conditions d'utilisation</button> et notre <button onClick={() => onNavigate('privacy')} className="underline">Politique de confidentialité</button>.
            </p>
          </div>
        ) : (
          <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Honeypot field (invisible to humans, visible to bots) */}
            <div className="hidden" aria-hidden="true">
              <input 
                type="text" 
                tabIndex={-1} 
                autoComplete="off"
                value={hpValue}
                onChange={(e) => setHpValue(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full px-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                      placeholder="Nom complet"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={20} />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.name as any).message}</p>}
                </div>
              )}
              
              <div className="space-y-1">
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                    placeholder="Votre adresse email"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={20} />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.email as any).message}</p>}
              </div>

              {mode !== 'reset' && (
                <>
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full px-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                        placeholder="Mot de passe"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={20} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.password as any).message}</p>}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          {...register('confirmPassword')}
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full px-12 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                          placeholder="Confirmer le mot de passe"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={20} />
                      </div>
                      {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.confirmPassword as any).message}</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-primary/70 cursor-pointer">
                  <input type="checkbox" className="mr-2 accent-accent" />
                  Se souvenir de moi
                </label>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-accent font-bold hover:underline"
                >
                  Oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all duration-300 flex items-center justify-center group shadow-xl"
            >
              {mode === 'login' && 'Se connecter'}
              {mode === 'signup' && "S'inscrire"}
              {mode === 'reset' && 'Envoyer le lien'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>
        )}

        <div className="text-center text-sm text-primary/70">
          {mode === 'login' && (
            <p>
              Pas encore de compte ?{' '}
              <button onClick={() => setMode('signup')} className="text-accent font-bold hover:underline">
                S'inscrire
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Déjà un compte ?{' '}
              <button onClick={() => setMode('login')} className="text-accent font-bold hover:underline">
                Se connecter
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="text-accent font-bold hover:underline">
              Retour à la connexion
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};


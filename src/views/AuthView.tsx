import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Phone, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  const [mode, setMode] = useState(initialMode);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<any>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    console.log("Auth Data:", data, "Method:", loginMethod);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      const message = mode === 'login' ? 'Connexion réussie !' : 
                     mode === 'signup' ? 'Compte créé avec succès !' : 
                     'Lien de réinitialisation envoyé !';
      
      toast.success(message);
      onNavigate('home');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Connexion Google réussie !');
      onNavigate('home');
    }, 1000);
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
          <p className="text-primary/60 text-sm">
            {mode === 'login' && 'Connectez-vous pour accéder à votre compte.'}
            {mode === 'signup' && 'Créez votre compte en quelques secondes.'}
            {mode === 'reset' && 'Entrez votre email pour réinitialiser votre mot de passe.'}
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl mb-8">
          <button 
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${loginMethod === 'email' ? 'bg-primary text-white shadow-md' : 'text-primary/40 hover:text-primary'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${loginMethod === 'phone' ? 'bg-primary text-white shadow-md' : 'text-primary/40 hover:text-primary'}`}
          >
            Téléphone
          </button>
          <button 
            onClick={() => setLoginMethod('google')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${loginMethod === 'google' ? 'bg-primary text-white shadow-md' : 'text-primary/40 hover:text-primary'}`}
          >
            Google
          </button>
        </div>

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
            <p className="text-center text-xs text-primary/40 leading-relaxed">
              En continuant avec Google, vous acceptez nos <button className="underline">Conditions d'utilisation</button> et notre <button className="underline">Politique de confidentialité</button>.
            </p>
          </div>
        ) : (
          <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full px-12 py-4 bg-secondary/50 border rounded-2xl focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                      placeholder="Nom complet"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.name as any).message}</p>}
                </div>
              )}
              
              <div className="space-y-1">
                <div className="relative">
                  <input
                    {...register('email')}
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    className={`w-full px-12 py-4 bg-secondary/50 border rounded-2xl focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                    placeholder={loginMethod === 'email' ? 'Votre adresse email' : 'Votre numéro de téléphone'}
                  />
                  {loginMethod === 'email' ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                  ) : (
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                  )}
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
                        className={`w-full px-12 py-4 bg-secondary/50 border rounded-2xl focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                        placeholder="Mot de passe"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
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
                          className={`w-full px-12 py-4 bg-secondary/50 border rounded-2xl focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-primary/10 focus:border-accent'}`}
                          placeholder="Confirmer le mot de passe"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                      </div>
                      {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-4">{(errors.confirmPassword as any).message}</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-primary/60 cursor-pointer">
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

        <div className="text-center text-sm text-primary/60">
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

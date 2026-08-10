import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Award, ShoppingBag } from 'lucide-react';
import { User, Badge } from '../../../types';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface DashboardLoyaltyProps {
  userProfile: User;
  badges: Badge[];
  onRedeemPoints: (cost: number, rewardName: string) => void;
}

export const DashboardLoyalty: React.FC<DashboardLoyaltyProps> = ({
  userProfile,
  badges,
  onRedeemPoints
}) => {
  let computedStatus = 'Débutant';
  if (userProfile.points >= 1000 && userProfile.points < 2500) computedStatus = 'Passionné';
  if (userProfile.points >= 2500 && userProfile.points < 5000) computedStatus = 'Artisan';
  if (userProfile.points >= 5000) computedStatus = 'Maître Créateur';

  // Make sure it doesn't crash if userProfile.orders is undefined
  const hasOrders = typeof userProfile.orders === 'number' 
    ? userProfile.orders > 0 
    : (Array.isArray(userProfile.orders) ? (userProfile.orders as any).length > 0 : false);

  const defaultBadges = [
    {
      id: 'b1',
      name: 'Premier Achat',
      description: 'Vous avez effectué votre première commande.',
      icon: '🛍️',
      unlocked: hasOrders || userProfile.points > 0
    },
    {
      id: 'b2',
      name: 'Passionné',
      description: 'Vous avez atteint le cap des 1000 points.',
      icon: '❤️',
      unlocked: userProfile.points >= 1000
    },
    {
      id: 'b3',
      name: 'Artisan',
      description: 'Vous avez atteint le cap des 2500 points.',
      icon: '🧵',
      unlocked: userProfile.points >= 2500
    },
    {
      id: 'b4',
      name: 'Maître Créateur',
      description: 'Vous avez atteint le cap des 5000 points.',
      icon: '👑',
      unlocked: userProfile.points >= 5000
    }
  ] as any[];

  const displayBadges = badges && badges.length > 0 ? badges : defaultBadges;

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-primary to-accent p-12 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white/70 font-bold uppercase tracking-widest text-xs mb-4">
            <Sparkles size={16} />
            <span>Programme de Fidélité</span>
          </div>
          <h3 className="text-4xl font-serif mb-2">Votre Statut : <span className="italic">{computedStatus}</span></h3>
          <p className="text-white/70 mb-8 max-w-md">Continuez à créer et à partager pour débloquer des réductions exclusives et des cadeaux.</p>
          
          <div className="flex items-end gap-4">
            <div className="text-6xl font-bold">{userProfile.points}</div>
            <div className="mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Points Cumulés</p>
              <p className="text-sm font-medium">
                {userProfile.points < 1000 ? `Prochain palier dans ${1000 - userProfile.points} pts` : 
                 userProfile.points < 2500 ? `Prochain palier dans ${2500 - userProfile.points} pts` :
                 userProfile.points < 5000 ? `Prochain palier dans ${5000 - userProfile.points} pts` :
                 'Niveau Maximum Atteint !'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-md h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, 
                  userProfile.points < 1000 ? (userProfile.points / 1000) * 100 :
                  userProfile.points < 2500 ? (userProfile.points / 2500) * 100 :
                  (userProfile.points / 5000) * 100
                )}%` 
              }}
              className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            />
          </div>
        </div>
        <Trophy className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 -rotate-12" />
      </div>

      {/* Referral Section - High Value Feature */}
      <div className="bg-accent/5 p-10 rounded-[3rem] border border-accent/20 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-shrink-0 w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3">
          <Sparkles size={48} />
        </div>
        <div className="flex-grow min-w-0 text-center md:text-left">
          <h4 className="text-2xl font-serif text-primary mb-2 truncate">Gagnez des points en parrainant !</h4>
          <p className="text-primary/70 max-w-xl mb-6">
            Partagez votre amour pour le tricot. Pour chaque ami qui passe sa première commande avec votre lien, vous recevez <span className="font-bold text-accent">20 points</span> et votre ami bénéficie de <span className="font-bold text-accent">5% de réduction</span> sur son premier achat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 min-w-0 px-4 sm:px-6 py-3 bg-white rounded-2xl border border-primary/10 font-mono text-xs flex items-center text-primary/70 truncate">
              {window.location.origin}/invite/{userProfile.id?.substring(0, 8)}
            </div>
            <Button 
              onClick={() => {
                const link = `${window.location.origin}/invite/${userProfile.id?.substring(0, 8)}`;
                navigator.clipboard.writeText(link);
                toast.success('Lien de parrainage copié !');
              }}
              className="shrink-0 whitespace-nowrap rounded-2xl px-4 sm:px-8 h-auto py-3 font-bold shadow-lg shadow-accent/20"
            >
              Copier le lien
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} />
          </div>
          <h5 className="font-bold text-primary mb-1">Achetez & Gagnez</h5>
          <p className="text-xs text-primary/70">Gagnez 1% de vos achats en points de fidélité.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm text-center">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} />
          </div>
          <h5 className="font-bold text-primary mb-1">Parrainez des amis</h5>
          <p className="text-xs text-primary/70">20 points pour chaque premier achat parrainé.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award size={24} />
          </div>
          <h5 className="font-bold text-primary mb-1">Badges Exclusifs</h5>
          <p className="text-xs text-primary/70">Débloquez des avantages en montant de niveau.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm">
          <h4 className="text-xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
            <Award className="text-accent" />
            Mes Badges
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {displayBadges.map(badge => (
              <div 
                key={badge.id} 
                className={`p-6 rounded-3xl border transition-all text-center ${
                  badge.unlocked 
                    ? 'bg-accent/5 border-accent/20' 
                    : 'bg-secondary/30 border-primary/5 opacity-40 grayscale'
                }`}
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h5 className="font-bold text-sm text-primary mb-1">{badge.name}</h5>
                <p className="text-[10px] text-primary/70 leading-tight">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm">
          <h4 className="text-xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
            <ShoppingBag className="text-accent" />
            Récompenses Disponibles
          </h4>
          <div className="space-y-4">
            {[
              { id: 'free-shipping', name: 'Livraison Gratuite', cost: 1000, icon: '🚚' },
              { id: '10k-coupon', name: 'Coupon -10 000 FCFA', cost: 2500, icon: '🎁' },
              { id: 'mega-reward', name: 'Livraison + Coupon -15 000 FCFA', cost: 5000, icon: '👑' },
            ].map((reward, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{reward.icon}</div>
                  <div>
                    <p className="font-bold text-sm text-primary">{reward.name}</p>
                    <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">{reward.cost} Points</p>
                  </div>
                </div>
                <Button 
                  variant={userProfile.points >= reward.cost ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onRedeemPoints(reward.cost, reward.id)}
                  disabled={userProfile.points < reward.cost}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all h-auto ${
                    userProfile.points >= reward.cost 
                      ? 'bg-primary text-white hover:bg-accent' 
                      : 'bg-primary/5 text-primary/70 cursor-not-allowed'
                  }`}
                >
                  Échanger
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

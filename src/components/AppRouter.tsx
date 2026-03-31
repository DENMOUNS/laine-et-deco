import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HomeView } from '../views/HomeView';
import { ShopView } from '../views/ShopView';
import { AuthView } from '../views/AuthView';
import { CartView } from '../views/CartView';
import AdminDashboard from '../views/AdminDashboard';
import { ProductDetailView } from '../views/ProductDetailView';
import { CheckoutView } from '../views/CheckoutView';
import { TeamView } from '../views/TeamView';
import { PackDetailView } from '../views/PackDetailView';
import { BlogIndexView } from '../views/BlogIndexView';
import { BlogPostView } from '../views/BlogPostView';
import { CustomerDashboard } from '../views/CustomerDashboard';
import { LookbookView } from '../views/LookbookView';
import { GalleryView } from '../views/GalleryView';
import { CareGuideView } from '../views/CareGuideView';
import { ContactView } from '../views/ContactView';
import { AboutView } from '../views/AboutView';
import { WoolCalculatorView } from '../views/WoolCalculatorView';
import { VolumeCalculatorView } from '../views/VolumeCalculatorView';
import { GiftBoxView } from '../views/GiftBoxView';
import { StaticPageView } from './StaticPageView';
import { Product, SiteConfig, PromoEvent, Currency, Pack } from '../types';
import { PACKS } from '../constants';

interface AppRouterProps {
  currentView: string;
  selectedId: string | null;
  selectedProduct: Product | null;
  initialSearchQuery: string;
  siteConfig: SiteConfig;
  events: PromoEvent[];
  cart: { product: Product; quantity: number }[];
  wishlist: Product[];
  currency: Currency;
  trackingOrder: string;
  setTrackingOrder: (s: string) => void;
  handleNavigate: (view: string, id?: string, query?: string) => void;
  addToCart: (p: Product, q?: number) => void;
  addToWishlist: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  setQuickViewProduct: (p: Product | null) => void;
  setCart: (c: any[]) => void;
  setWishlist: (w: Product[]) => void;
  setSiteConfig: (s: SiteConfig) => void;
  addPackToCart: (p: any) => void;
  handleProductClick: (p: Product) => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  currentView, selectedId, selectedProduct, initialSearchQuery, siteConfig, events,
  cart, wishlist, currency, trackingOrder, setTrackingOrder, handleNavigate,
  addToCart, addToWishlist, removeFromCart, updateCartQuantity, setQuickViewProduct,
  setCart, setWishlist, setSiteConfig, addPackToCart, handleProductClick
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
        {currentView === 'home' && <HomeView onNavigate={handleNavigate} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={setQuickViewProduct} onProductClick={handleProductClick} siteConfig={siteConfig} events={events} />}
        {currentView === 'shop' && <ShopView onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={setQuickViewProduct} onProductClick={handleProductClick} events={events} initialSearchQuery={initialSearchQuery} />}
        {currentView === 'blog' && <BlogIndexView onNavigate={handleNavigate} />}
        {currentView === 'team' && <TeamView />}
        {currentView === 'pack-detail' && selectedId && <PackDetailView pack={PACKS.find(p => p.id === selectedId)!} onNavigate={handleNavigate} onAddToCart={addPackToCart} />}
        {currentView === 'blog-post' && selectedId && <BlogPostView postId={selectedId} onNavigate={handleNavigate} />}
        {currentView === 'login' && <AuthView onNavigate={handleNavigate} initialMode="login" />}
        {currentView === 'signup' && <AuthView onNavigate={handleNavigate} initialMode="signup" />}
        {currentView === 'cart' && <CartView cart={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onNavigate={handleNavigate} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={setQuickViewProduct} />}
        {currentView === 'checkout' && <CheckoutView cart={cart} onNavigate={handleNavigate} onComplete={() => setCart([])} />}
        {currentView === 'product-detail' && selectedProduct && <ProductDetailView product={selectedProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={setQuickViewProduct} onNavigate={handleNavigate} events={events} />}
        {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
        {currentView === 'customer-dashboard' && <CustomerDashboard onNavigate={handleNavigate} />}
        {currentView === 'about' && <AboutView onNavigate={handleNavigate} />}
        {currentView === 'contact' && <ContactView onNavigate={handleNavigate} />}
        {currentView === 'lookbook' && <LookbookView onNavigate={handleNavigate} onAddToCart={addToCart} />}
        {currentView === 'gallery' && <GalleryView onNavigate={handleNavigate} />}
        {currentView === 'care-guide' && <CareGuideView onNavigate={handleNavigate} />}
        {currentView === 'wool-calculator' && <WoolCalculatorView onNavigate={handleNavigate} onAddToCart={addToCart} />}
        {currentView === 'volume-calculator' && <VolumeCalculatorView onNavigate={handleNavigate} onAddToCart={addToCart} />}
        {currentView === 'gift-box' && <GiftBoxView onNavigate={handleNavigate} onAddToCart={addToCart} />}
        {currentView === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-4xl font-serif">Ma Liste de Souhaits</h1>
              {wishlist.length > 0 && (
                <button onClick={() => { navigator.clipboard.writeText(window.location.href + '?wishlist=shared'); }} className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-colors text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                  Partager ma liste
                </button>
              )}
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-primary/5">
                <p className="text-xl text-primary/40 font-serif italic">Votre liste est vide.</p>
                <button onClick={() => handleNavigate('shop')} className="mt-4 text-accent font-bold underline">Aller faire un tour</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlist.map(p => (
                  <div key={p.id} className="relative group bg-white p-4 rounded-[2rem] border border-primary/5 card-hover">
                    <img src={p.image} alt={p.name} className="aspect-[3/4] object-cover rounded-2xl w-full" referrerPolicy="no-referrer" />
                    <div className="mt-4">
                      <h3 className="font-serif text-lg">{p.name}</h3>
                      <p className="font-bold text-accent">{(p.price * currency.rate).toLocaleString()} {currency.symbol}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => addToCart(p)} className="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors">Ajouter au panier</button>
                      <button onClick={() => setWishlist(wishlist.filter(item => item.id !== p.id))} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Retirer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {currentView === 'order-tracking' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-serif mb-8 text-center">Suivi de Commande</h1>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5 mb-12 text-center">
              <p className="text-primary/60 mb-6">Entrez votre numéro de commande pour suivre son état en temps réel.</p>
              <div className="flex gap-4">
                <input type="text" placeholder="Ex: ORD-001" value={trackingOrder} onChange={(e) => setTrackingOrder(e.target.value.toUpperCase())} className="flex-grow px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono" />
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-colors">Suivre</button>
              </div>
            </div>
          </div>
        )}
        {currentView === 'faq' && <StaticPageView title="Foire Aux Questions" onBack={() => handleNavigate('home')} content={<div className="space-y-8">{[{ q: "Comment puis-je suivre ma commande ?", a: "Vous pouvez suivre votre commande via l'onglet 'Suivi de commande' en utilisant votre numéro de commande reçu par email." }, { q: "Quels sont les délais de livraison ?", a: "Pour Douala et Yaoundé, comptez 24h à 48h. Pour les autres villes, entre 3 et 5 jours ouvrés." }, { q: "Puis-je retourner un article ?", a: "Oui, vous disposez de 14 jours après réception pour nous retourner un article dans son emballage d'origine." }].map((item, i) => (<div key={i} className="border-b border-primary/5 pb-6"><h3 className="text-xl font-bold text-primary mb-2">{item.q}</h3><p className="text-primary/70">{item.a}</p></div>))}</div>} />}
        {currentView === 'shipping' && <StaticPageView title="Livraison" onBack={() => handleNavigate('home')} content={<div className="space-y-6"><p>Nous livrons dans tout le Cameroun et à l'international.</p><h2 className="text-2xl font-bold">Tarifs de livraison</h2><ul className="list-disc pl-6 space-y-2"><li>Douala : 1 500 FCFA</li><li>Yaoundé : 2 500 FCFA</li><li>Autres villes : À partir de 3 500 FCFA</li></ul><p>La livraison est gratuite pour toute commande supérieure à 50 000 FCFA.</p></div>} />}
        {currentView === 'returns' && <StaticPageView title="Retours et Remboursements" onBack={() => handleNavigate('home')} content={<div className="space-y-6"><p>Votre satisfaction est notre priorité. Si un article ne vous convient pas, vous pouvez nous le retourner.</p><h2 className="text-2xl font-bold">Conditions de retour</h2><p>L'article doit être retourné dans son état d'origine, non utilisé et dans son emballage complet.</p><p>Les frais de retour sont à la charge du client, sauf en cas d'article défectueux à la réception.</p></div>} />}
        {currentView === 'legal' && <StaticPageView title="Mentions Légales" onBack={() => handleNavigate('home')} content={<div className="space-y-6"><p>Éditeur du site : Laine & Déco SARL</p><p>Siège social : Douala, Cameroun</p><p>Directeur de la publication : Landry M.</p><p>Hébergement : Google Cloud Platform</p></div>} />}
        {currentView === 'privacy' && <StaticPageView title="Politique de Confidentialité" onBack={() => handleNavigate('home')} content={<div className="space-y-6"><p>Nous accordons une grande importance à la protection de vos données personnelles.</p><p>Les informations collectées lors de votre commande sont uniquement utilisées pour le traitement de celle-ci et pour vous informer de nos offres si vous y avez consenti.</p><p>Conformément à la loi, vous disposez d'un droit d'accès, de modification et de suppression de vos données.</p></div>} />}
        {currentView === 'terms' && <StaticPageView title="Conditions Générales de Vente" onBack={() => handleNavigate('home')} content={<div className="space-y-6"><p>Les présentes CGV régissent les ventes effectuées sur le site Laine & Déco.</p><h2 className="text-2xl font-bold">Prix</h2><p>Les prix sont indiqués en FCFA toutes taxes comprises.</p><h2 className="text-2xl font-bold">Paiement</h2><p>Nous acceptons les paiements par Mobile Money (Orange & MTN) et par carte bancaire.</p></div>} />}
      </motion.div>
    </AnimatePresence>
  );
};

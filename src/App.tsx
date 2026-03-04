import { useState, useEffect } from 'react';
import { Navbar, Footer } from './components/Layout';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { AuthView } from './views/AuthView';
import { CartView } from './views/CartView';
import { AdminDashboard } from './views/AdminDashboard';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { BlogIndexView } from './views/BlogIndexView';
import { BlogPostView } from './views/BlogPostView';
import { CustomerDashboard } from './views/CustomerDashboard';
import { Product, SiteConfig, Language, Currency, PromoEvent } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG, LANGUAGES, CURRENCIES, ORDERS, PRODUCTS } from './constants';
import { ChatBubble } from './components/ChatBubble';
import { QuickViewModal } from './components/QuickViewModal';
import { Toaster, toast as sonnerToast } from 'sonner';
import { Loader } from './components/Loader';
import { updateSEOMeta } from './utils/siteUtils';
import { AlertCircle, Clock } from 'lucide-react';
import { StaticPageView } from './components/StaticPageView';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [trackingOrder, setTrackingOrder] = useState<string>('');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else sonnerToast.info(message);
  };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [events, setEvents] = useState<PromoEvent[]>([]);

  const handleNavigate = (view: string, id?: string, query?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentView(view);
      if (id) setSelectedId(id);
      if (query) setInitialSearchQuery(query);
      else if (view !== 'shop') setInitialSearchQuery(''); // Clear if not navigating to shop
      setIsLoading(false);
    }, 600);
  };

  // SEO & Meta Tags
  useEffect(() => {
    if (currentView === 'home') {
      updateSEOMeta(siteConfig.seo.home.title, siteConfig.seo.home.description, siteConfig.seo.home.ogImage);
    } else if (currentView === 'shop') {
      updateSEOMeta(siteConfig.seo.shop.title, siteConfig.seo.shop.description, siteConfig.seo.shop.ogImage);
    } else if (currentView === 'contact') {
      updateSEOMeta(siteConfig.seo.contact.title, siteConfig.seo.contact.description, siteConfig.seo.contact.ogImage);
    } else if (currentView === 'about') {
      updateSEOMeta(siteConfig.seo.about.title, siteConfig.seo.about.description, siteConfig.seo.about.ogImage);
    } else if (currentView === 'product-detail' && selectedProduct) {
      const title = selectedProduct.seo?.title || `${selectedProduct.name} - Laine & Déco`;
      const desc = selectedProduct.seo?.description || selectedProduct.description;
      updateSEOMeta(title, desc, selectedProduct.image);
    }
  }, [currentView, selectedProduct, siteConfig]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`${product.name} ajouté au panier !`);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) {
        showToast(`${product.name} est déjà dans vos favoris`, 'info');
        return prev;
      }
      showToast(`${product.name} ajouté aux favoris !`);
      return [...prev, product];
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  const isAdminView = currentView.startsWith('admin');
  const isMaintenance = siteConfig.maintenance.isActive && !isAdminView;

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-8"
        >
          <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold text-primary">Site en Maintenance</h1>
            <p className="text-primary/60 text-lg leading-relaxed">{siteConfig.maintenance.message}</p>
          </div>
          {siteConfig.maintenance.endDate && (
            <div className="flex items-center justify-center gap-3 text-accent font-bold bg-accent/5 py-4 rounded-2xl">
              <Clock size={20} />
              <span>Retour prévu le {new Date(siteConfig.maintenance.endDate).toLocaleString()}</span>
            </div>
          )}
          <div className="pt-8 border-t border-primary/5">
            <h2 className="text-xl font-serif font-bold text-primary mb-2">Laine<span className="text-accent">&</span>Déco</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-primary/30">Merci de votre patience</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        :root {
          --color-primary: ${siteConfig.primaryColor};
          --color-accent: ${siteConfig.accentColor};
        }
      `}</style>
      {!isAdminView && (
        <Navbar 
          onNavigate={handleNavigate} 
          currentView={currentView} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          language={language}
          setLanguage={setLanguage}
          currency={currency}
          setCurrency={setCurrency}
        />
      )}
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'home' && (
              <HomeView 
                onNavigate={handleNavigate} 
                onAddToCart={(p) => addToCart(p)}
                onAddToWishlist={addToWishlist}
                onQuickView={setQuickViewProduct}
                onProductClick={handleProductClick}
                siteConfig={siteConfig}
                events={events}
              />
            )}
            {currentView === 'shop' && (
              <ShopView 
                onAddToCart={(p) => addToCart(p)}
                onAddToWishlist={addToWishlist}
                onQuickView={setQuickViewProduct}
                onProductClick={handleProductClick}
                events={events}
                initialSearchQuery={initialSearchQuery}
              />
            )}
            {currentView === 'blog' && (
              <BlogIndexView onNavigate={handleNavigate} />
            )}
            {currentView === 'blog-post' && selectedId && (
              <BlogPostView postId={selectedId} onNavigate={handleNavigate} />
            )}
            {currentView === 'login' && <AuthView onNavigate={handleNavigate} initialMode="login" />}
            {currentView === 'signup' && <AuthView onNavigate={handleNavigate} initialMode="signup" />}
            {currentView === 'cart' && (
              <CartView 
                cart={cart} 
                onUpdateQuantity={updateCartQuantity} 
                onRemove={removeFromCart}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === 'checkout' && (
              <CheckoutView 
                cart={cart} 
                onNavigate={handleNavigate} 
                onComplete={() => setCart([])}
              />
            )}
            {currentView === 'product-detail' && selectedProduct && (
              <ProductDetailView 
                product={selectedProduct} 
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                onQuickView={setQuickViewProduct}
                onNavigate={handleNavigate}
                events={events}
              />
            )}
            {currentView === 'admin-dashboard' && (
              <AdminDashboard onNavigate={handleNavigate} />
            )}
            {currentView === 'customer-dashboard' && (
              <CustomerDashboard onNavigate={handleNavigate} />
            )}
            {currentView === 'wishlist' && (
              <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-serif mb-12">Ma Liste de Souhaits</h1>
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
                          <button 
                            onClick={() => addToCart(p)}
                            className="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                          >
                            Ajouter au panier
                          </button>
                          <button 
                            onClick={() => setWishlist(prev => prev.filter(item => item.id !== p.id))}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                            title="Retirer"
                          >
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
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5 mb-12">
                  <p className="text-center text-primary/60 mb-6">Entrez votre numéro de commande pour suivre son état en temps réel.</p>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Ex: ORD-001" 
                      value={trackingOrder}
                      onChange={(e) => setTrackingOrder(e.target.value.toUpperCase())}
                      className="flex-grow px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono"
                    />
                    <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-colors">
                      Suivre
                    </button>
                  </div>
                </div>

                {trackingOrder && ORDERS.find(o => o.id === trackingOrder) ? (
                  <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-primary/5">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary/40 font-bold mb-1">Commande</p>
                          <h2 className="text-2xl font-mono font-bold">{trackingOrder}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-widest text-primary/40 font-bold mb-1">Statut Actuel</p>
                          <span className="px-4 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest">
                            {ORDERS.find(o => o.id === trackingOrder)?.status}
                          </span>
                        </div>
                      </div>

                      <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {ORDERS.find(o => o.id === trackingOrder)?.trackingSteps?.map((step, i) => (
                          <div key={i} className="relative pl-10">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`} />
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-bold ${step.completed ? 'text-primary' : 'text-primary/40'}`}>{step.status}</h3>
                                <p className="text-sm text-primary/60">{step.description}</p>
                              </div>
                              <span className="text-xs font-mono text-primary/40">{step.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : trackingOrder && (
                  <div className="text-center py-12 bg-red-50 rounded-[3rem] border border-red-100">
                    <p className="text-red-500 font-bold">Aucune commande trouvée avec ce numéro.</p>
                  </div>
                )}
              </div>
            )}

            {currentView === 'about' && (
              <StaticPageView 
                title="À Propos de Nous" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Bienvenue chez Laine & Déco, votre destination privilégiée pour l'artisanat et la décoration d'intérieur authentique au Cameroun.</p>
                    <p>Notre histoire commence par une passion pour les matières nobles et le savoir-faire manuel. Nous croyons que chaque foyer mérite une âme, et que cette âme se construit à travers des objets qui ont une histoire.</p>
                    <h2 className="text-2xl font-bold mt-8">Notre Mission</h2>
                    <p>Nous nous engageons à promouvoir l'artisanat local et international en sélectionnant rigoureusement des produits qui allient esthétique moderne et techniques traditionnelles.</p>
                  </div>
                }
              />
            )}

            {currentView === 'contact' && (
              <StaticPageView 
                title="Contactez-nous" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <p>Une question ? Un projet de décoration ? Notre équipe est à votre écoute.</p>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-primary">Adresse</h3>
                          <p>Douala, Akwa - Rue des Écoles</p>
                        </div>
                        <div>
                          <h3 className="font-bold text-primary">Email</h3>
                          <p>contact@laine-deco.com</p>
                        </div>
                        <div>
                          <h3 className="font-bold text-primary">Téléphone</h3>
                          <p>+237 600 000 000</p>
                        </div>
                      </div>
                    </div>
                    <form className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-primary/5">
                      <input type="text" placeholder="Votre nom" className="w-full px-4 py-3 rounded-xl border border-primary/10 focus:outline-none focus:border-accent" />
                      <input type="email" placeholder="Votre email" className="w-full px-4 py-3 rounded-xl border border-primary/10 focus:outline-none focus:border-accent" />
                      <textarea placeholder="Votre message" className="w-full px-4 py-3 rounded-xl border border-primary/10 focus:outline-none focus:border-accent h-32"></textarea>
                      <button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-colors">Envoyer</button>
                    </form>
                  </div>
                }
              />
            )}

            {currentView === 'faq' && (
              <StaticPageView 
                title="Foire Aux Questions" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-8">
                    {[
                      { q: "Comment puis-je suivre ma commande ?", a: "Vous pouvez suivre votre commande via l'onglet 'Suivi de commande' en utilisant votre numéro de commande reçu par email." },
                      { q: "Quels sont les délais de livraison ?", a: "Pour Douala et Yaoundé, comptez 24h à 48h. Pour les autres villes, entre 3 et 5 jours ouvrés." },
                      { q: "Puis-je retourner un article ?", a: "Oui, vous disposez de 14 jours après réception pour nous retourner un article dans son emballage d'origine." }
                    ].map((item, i) => (
                      <div key={i} className="border-b border-primary/5 pb-6">
                        <h3 className="text-xl font-bold text-primary mb-2">{item.q}</h3>
                        <p className="text-primary/70">{item.a}</p>
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {currentView === 'shipping' && (
              <StaticPageView 
                title="Livraison" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Nous livrons dans tout le Cameroun et à l'international.</p>
                    <h2 className="text-2xl font-bold">Tarifs de livraison</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Douala : 1 500 FCFA</li>
                      <li>Yaoundé : 2 500 FCFA</li>
                      <li>Autres villes : À partir de 3 500 FCFA</li>
                    </ul>
                    <p>La livraison est gratuite pour toute commande supérieure à 50 000 FCFA.</p>
                  </div>
                }
              />
            )}

            {currentView === 'returns' && (
              <StaticPageView 
                title="Retours et Remboursements" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Votre satisfaction est notre priorité. Si un article ne vous convient pas, vous pouvez nous le retourner.</p>
                    <h2 className="text-2xl font-bold">Conditions de retour</h2>
                    <p>L'article doit être retourné dans son état d'origine, non utilisé et dans son emballage complet.</p>
                    <p>Les frais de retour sont à la charge du client, sauf en cas d'article défectueux à la réception.</p>
                  </div>
                }
              />
            )}

            {currentView === 'legal' && (
              <StaticPageView 
                title="Mentions Légales" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Éditeur du site : Laine & Déco SARL</p>
                    <p>Siège social : Douala, Cameroun</p>
                    <p>Directeur de la publication : Landry M.</p>
                    <p>Hébergement : Google Cloud Platform</p>
                  </div>
                }
              />
            )}

            {currentView === 'privacy' && (
              <StaticPageView 
                title="Politique de Confidentialité" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Nous accordons une grande importance à la protection de vos données personnelles.</p>
                    <p>Les informations collectées lors de votre commande sont uniquement utilisées pour le traitement de celle-ci et pour vous informer de nos offres si vous y avez consenti.</p>
                    <p>Conformément à la loi, vous disposez d'un droit d'accès, de modification et de suppression de vos données.</p>
                  </div>
                }
              />
            )}

            {currentView === 'terms' && (
              <StaticPageView 
                title="Conditions Générales de Vente" 
                onBack={() => handleNavigate('home')}
                content={
                  <div className="space-y-6">
                    <p>Les présentes CGV régissent les ventes effectuées sur le site Laine & Déco.</p>
                    <h2 className="text-2xl font-bold">Prix</h2>
                    <p>Les prix sont indiqués en FCFA toutes taxes comprises.</p>
                    <h2 className="text-2xl font-bold">Paiement</h2>
                    <p>Nous acceptons les paiements par Mobile Money (Orange & MTN) et par carte bancaire.</p>
                  </div>
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdminView && <Footer onNavigate={handleNavigate} />}
      {!isAdminView && <ChatBubble />}
      <Toaster position="top-center" richColors />
      {isLoading && <Loader fullScreen text="Chargement..." />}
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
      />
    </div>
  );
}

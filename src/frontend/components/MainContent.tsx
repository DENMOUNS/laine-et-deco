import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader } from './Loader';
import { toast } from 'sonner';
const HomeView = lazy(() => import('../views/HomeView').then(m => ({ default: m.HomeView })));
const ShopView = lazy(() => import('../views/ShopView').then(m => ({ default: m.ShopView })));

// Lazy loaded views
const AuthView = lazy(() => import('../views/AuthView').then(m => ({ default: m.AuthView })));
const CartView = lazy(() => import('../views/CartView').then(m => ({ default: m.CartView })));
const AdminDashboard = lazy(() => import('../views/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProductDetailView = lazy(() => import('../views/AdminProductDetailView').then(m => ({ default: m.AdminProductDetailView })));
const AdminUserDetailView = lazy(() => import('../views/AdminUserDetailView').then(m => ({ default: m.AdminUserDetailView })));
const AdminLogsView = lazy(() => import('../views/AdminLogsView').then(m => ({ default: m.AdminLogsView })));
const ProductDetailView = lazy(() => import('../views/ProductDetailView').then(m => ({ default: m.ProductDetailView })));
const CheckoutView = lazy(() => import('../views/CheckoutView').then(m => ({ default: m.CheckoutView })));
const TeamView = lazy(() => import('../views/TeamView').then(m => ({ default: m.TeamView })));
const PacksView = lazy(() => import('../views/PacksView').then(m => ({ default: m.PacksView })));
const CustomPackBuilderView = lazy(() => import('../views/CustomPackBuilderView').then(m => ({ default: m.CustomPackBuilderView })));
const PackDetailView = lazy(() => import('../views/PackDetailView').then(m => ({ default: m.PackDetailView })));
const BlogIndexView = lazy(() => import('../views/BlogIndexView').then(m => ({ default: m.BlogIndexView })));
const BlogPostView = lazy(() => import('../views/BlogPostView').then(m => ({ default: m.BlogPostView })));
const CustomerDashboard = lazy(() => import('../views/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const CalculatorView = lazy(() => import('../views/CalculatorView').then(m => ({ default: m.CalculatorView })));
const CustomOrderView = lazy(() => import('../views/CustomOrderView').then(m => ({ default: m.CustomOrderView })));
const VolumeCalculatorView = lazy(() => import('../views/VolumeCalculatorView').then(m => ({ default: m.VolumeCalculatorView })));
const CareGuideView = lazy(() => import('../views/CareGuideView').then(m => ({ default: m.CareGuideView })));
const LookbookView = lazy(() => import('../views/LookbookView').then(m => ({ default: m.LookbookView })));
const CommunityGalleryView = lazy(() => import('../views/CommunityGalleryView').then(m => ({ default: m.CommunityGalleryView })));
const KnittingConfiguratorView = lazy(() => import('../views/KnittingConfiguratorView').then(m => ({ default: m.KnittingConfiguratorView })));
const OrderSuccessView = lazy(() => import('../views/OrderSuccessView').then(m => ({ default: m.OrderSuccessView })));
const KnittingCompanionView = lazy(() => import('../views/KnittingCompanionView').then(m => ({ default: m.KnittingCompanionView })));
const PatternGeneratorView = lazy(() => import('../views/PatternGeneratorView').then(m => ({ default: m.PatternGeneratorView })));
const PrivacyPolicyView = lazy(() => import('../views/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const ComparisonView = lazy(() => import('../views/ComparisonView').then(m => ({ default: m.ComparisonView })));
const ContactView = lazy(() => import('../views/ContactView').then(m => ({ default: m.ContactView })));
const FAQView = lazy(() => import('../views/FAQView').then(m => ({ default: m.FAQView })));

const Error403View = lazy(() => import('../views/Error403View').then(m => ({ default: m.Error403View })));
const Error404View = lazy(() => import('../views/Error404View').then(m => ({ default: m.Error404View })));
const Error500View = lazy(() => import('../views/Error500View').then(m => ({ default: m.Error500View })));

const PortfolioLandryView = lazy(() => import('../views/PortfolioLandryView').then(m => ({ default: m.PortfolioLandryView })));
const PortfolioDoleresView = lazy(() => import('../views/PortfolioDoleresView').then(m => ({ default: m.PortfolioDoleresView })));

import { StaticPageView } from './StaticPageView';
import { ComparisonTool } from './ComparisonTool';
import { Product, SiteConfig, PromoEvent, CartItem } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { PRODUCTS as INITIAL_PRODUCTS, PACKS as INITIAL_PACKS, ORDERS as INITIAL_ORDERS } from '../../constants';
import { useProducts } from '../hooks/useProducts';
import { useEntity } from '../hooks/useEntity';
import { where } from 'firebase/firestore';

interface MainContentProps {
  currentView: string;
  handleNavigate: (view: string, id?: string, query?: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  addToWishlist: (product: Product) => void;
  setQuickViewProduct: (product: Product | null) => void;
  addToComparison: (product: Product) => void;
  handleProductClick: (product: Product) => void;
  siteConfig: SiteConfig;
  events: PromoEvent[];
  initialSearchQuery: string;
  cart: CartItem[];
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  setCart: (cart: CartItem[]) => void;
  selectedProduct: Product | null;
  setSiteConfig: (config: SiteConfig) => void;
  selectedId: string | null;
  addPackToCart: (pack: any) => void;
  wishlist: Product[];
  setWishlist: React.Dispatch<React.SetStateAction<Product[]>>;
  trackingOrder: string;
  setTrackingOrder: (orderId: string) => void;
  comparisonList: Product[];
  removeFromComparison: (id: string) => void;
  setComparisonList: React.Dispatch<React.SetStateAction<Product[]>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}

const VALID_VIEWS = [
  'home', 'shop', 'comparison', 'blog', 'team', 'calculator', 'custom-order', 
  'volume-calculator', 'care-guide', 'lookbook', 'community', 'knitting-companion', 
  'pattern-generator', 'configurator', 'packs', 'custom-pack', 'pack-detail', 
  'blog-post', 'login', 'auth', 'signup', 'cart', 'checkout', 'product-detail', 
  'admin-dashboard', 'admin-product-detail', 'admin-user-detail', 'admin-logs', 
  'customer-dashboard', 'order-success', 'wishlist', 'order-tracking', 'about', 
  'contact', 'faq', 'shipping', 'returns', 'legal', 'privacy', 'terms',
  'portfolio-landry', 'portfolio-doleres'
];

export const MainContent: React.FC<MainContentProps> = ({
  currentView,
  handleNavigate,
  addToCart,
  addToWishlist,
  setQuickViewProduct,
  addToComparison,
  handleProductClick,
  siteConfig,
  events,
  initialSearchQuery,
  cart,
  updateCartQuantity,
  removeFromCart,
  setCart,
  selectedProduct,
  setSiteConfig,
  selectedId,
  addPackToCart,
  wishlist,
  setWishlist,
  trackingOrder,
  setTrackingOrder,
  comparisonList,
  removeFromComparison,
  setComparisonList,
  user,
  isAuthLoading
}) => {
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS;
  const { data: PACKS } = useEntity<any>('pack', INITIAL_PACKS);
  
  const isAuthorizedAdmin = user?.email === 'landrymoutongo97@gmail.com';
  const orderQueryConstraints = isAuthorizedAdmin ? [] : [where('userId', '==', user?.uid || 'guest')];
  
  const { data: ORDERS } = useEntity<any>('order', INITIAL_ORDERS, {
    enabled: !isAuthLoading,
    constraints: orderQueryConstraints,
    deps: [user?.uid, isAuthorizedAdmin]
  });
  
  const isAdminView = currentView.startsWith('admin');

  if (isAdminView && isAuthLoading) {
    return <Loader fullScreen text="Vérification des accès admin..." />;
  }

  if (isAdminView && !isAuthorizedAdmin) {
    if (!user) {
      handleNavigate('auth');
      toast.error('Veuillez vous connecter pour accéder à l\'administration.');
      return null;
    } else {
      return (
        <Suspense fallback={<Loader fullScreen text="Accès refusé..." />}>
          <Error403View onNavigate={handleNavigate} />
        </Suspense>
      );
    }
  }

  return (
    <>
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        className="w-full"
      >
        <Suspense fallback={<Loader fullScreen text="Chargement..." />}>
        {currentView === 'home' && (
          <HomeView 
            onNavigate={handleNavigate} 
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            onQuickView={setQuickViewProduct}
            onAddToComparison={addToComparison}
            onProductClick={handleProductClick}
            siteConfig={siteConfig}
            events={events}
          />
        )}
        {currentView === 'shop' && (
          <ShopView 
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            onQuickView={setQuickViewProduct}
            onAddToComparison={addToComparison}
            onProductClick={handleProductClick}
            events={events}
            initialSearchQuery={initialSearchQuery}
          />
        )}
        {currentView === 'comparison' && (
          <ComparisonView 
            comparisonList={comparisonList}
            onRemove={removeFromComparison}
            onClear={() => setComparisonList([])}
            onNavigate={handleNavigate}
            onAddToCart={addToCart}
          />
        )}
        {currentView === 'blog' && (
          <BlogIndexView />
        )}
        {currentView === 'team' && (
          <TeamView onNavigate={handleNavigate} />
        )}
        {currentView === 'portfolio-landry' && (
          <PortfolioLandryView onNavigate={handleNavigate} />
        )}
        {currentView === 'portfolio-doleres' && (
          <PortfolioDoleresView onNavigate={handleNavigate} />
        )}
        {currentView === 'calculator' && (
          <CalculatorView onNavigate={handleNavigate} onAddToCart={addToCart} />
        )}
        {currentView === 'custom-order' && (
          <CustomOrderView />
        )}
        {currentView === 'volume-calculator' && (
          <VolumeCalculatorView onNavigate={handleNavigate} onAddToCart={addToCart} />
        )}
        {currentView === 'care-guide' && (
          <CareGuideView />
        )}
        {currentView === 'lookbook' && (
          <LookbookView onNavigate={handleNavigate} products={PRODUCTS} />
        )}
        {currentView === 'community' && (
          <CommunityGalleryView onNavigate={handleNavigate} />
        )}
        {currentView === 'knitting-companion' && (
          <KnittingCompanionView />
        )}
        {currentView === 'pattern-generator' && (
          <PatternGeneratorView onAddToCart={addToCart} onNavigate={handleNavigate} />
        )}
        {currentView === 'configurator' && (
          <KnittingConfiguratorView onAddToCart={addToCart} />
        )}
        {currentView === 'packs' && (
          <PacksView onNavigate={handleNavigate} onAddToCart={addToCart} onAddPackToCart={addPackToCart} />
        )}
        {currentView === 'custom-pack' && (
          <CustomPackBuilderView onAddToCart={addToCart} allProducts={PRODUCTS} />
        )}
        {currentView === 'pack-detail' && selectedId && (
          <PackDetailView 
            packId={selectedId} 
            onNavigate={handleNavigate} 
            onAddToCart={addToCart}
            onAddPackToCart={addPackToCart}
          />
        )}
        {currentView === 'blog-post' && selectedId && (
          <BlogPostView postId={selectedId} onNavigate={handleNavigate} />
        )}
        {(currentView === 'login' || currentView === 'auth') && <AuthView onNavigate={handleNavigate} initialMode="login" />}
        {currentView === 'signup' && <AuthView onNavigate={handleNavigate} initialMode="signup" />}
        {currentView === 'cart' && (
          <CartView 
            cart={cart} 
            onUpdateQuantity={updateCartQuantity} 
            onRemove={removeFromCart}
            onNavigate={handleNavigate}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            onQuickView={setQuickViewProduct}
            allProducts={PRODUCTS}
          />
        )}
        {currentView === 'checkout' && (
          <CheckoutView 
            cart={cart} 
            user={user}
            onNavigate={handleNavigate} 
            onComplete={() => setCart([])}
            allProducts={PRODUCTS}
          />
        )}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView 
            product={selectedProduct} 
            allProducts={PRODUCTS}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            onQuickView={setQuickViewProduct}
            onNavigate={handleNavigate}
            events={events}
          />
        )}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard onNavigate={handleNavigate} siteConfig={siteConfig} setSiteConfig={setSiteConfig} user={user} isAuthLoading={isAuthLoading} />
        )}
        {currentView === 'admin-product-detail' && selectedId && (
          <AdminProductDetailView productId={selectedId} onNavigate={handleNavigate} />
        )}
        {currentView === 'admin-user-detail' && selectedId && (
          <AdminUserDetailView userId={selectedId} onNavigate={handleNavigate} />
        )}
        {currentView === 'admin-logs' && (
          <AdminLogsView onNavigate={handleNavigate} />
        )}
        {currentView === 'customer-dashboard' && (
          <CustomerDashboard onNavigate={handleNavigate} user={user} initialTab={selectedId || 'overview'} />
        )}
        {currentView === 'order-success' && (
          <OrderSuccessView onNavigate={handleNavigate} />
        )}
        {currentView === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-4xl font-serif">Ma Liste de Souhaits</h1>
              {wishlist.length > 0 && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href + '?wishlist=shared');
                    toast.success('Lien de partage copié dans le presse-papier !');
                  }}
                  className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                  Partager ma liste
                </button>
              )}
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-primary/5">
                <p className="text-xl text-primary/70 font-serif italic">Votre liste est vide.</p>
                <button onClick={() => handleNavigate('shop')} className="mt-4 text-accent font-bold underline">Aller faire un tour</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlist.map(p => (
                  <div key={p.id} className="relative group bg-white p-4 rounded-[2rem] border border-primary/5 card-hover">
                    <img src={p.image} alt={p.name} className="aspect-[3/4] object-cover rounded-2xl w-full" referrerPolicy="no-referrer" />
                    <div className="mt-4">
                      <h3 className="font-serif text-lg">{p.name}</h3>
                      <p className="font-bold text-accent">{p.price.toLocaleString()} FCFA</p>
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
              <p className="text-center text-primary/70 mb-6">Entrez votre numéro de commande pour suivre son état en temps réel.</p>
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
                      <p className="text-xs uppercase tracking-widest text-primary/70 font-bold mb-1">Commande</p>
                      <h2 className="text-2xl font-mono font-bold">{trackingOrder}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-primary/70 font-bold mb-1">Statut Actuel</p>
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
                            <h3 className={`font-bold ${step.completed ? 'text-primary' : 'text-primary/70'}`}>{step.status}</h3>
                            <p className="text-sm text-primary/70">{step.description}</p>
                          </div>
                          <span className="text-xs font-mono text-primary/70">{step.date}</span>
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
                <p>Bienvenue chez Laine et Déco, votre destination pour l'artisanat, la décoration et les nouvelles technologies.</p>
                <p>Notre histoire commence par une passion pour les matières nobles et le savoir-faire manuel. Nous croyons que chaque foyer mérite une âme, et que cette âme se construit à travers des objets qui ont une histoire.</p>
                <h2 className="text-2xl font-bold mt-8">Notre Mission</h2>
                <p>Nous nous engageons à promouvoir l'artisanat local et international en sélectionnant rigoureusement des produits qui allient esthétique moderne et techniques traditionnelles.</p>
                <div className="mt-12 p-8 bg-primary/5 rounded-3xl border border-primary/10">
                  <h2 className="text-2xl font-serif font-bold mb-4 text-primary">L'Équipe Fondatrice</h2>
                  <p className="mb-4">Ce projet est né de la vision commune de <strong>Landry et Doleres</strong>, passionnés par l'artisanat et la décoration.</p>
                  <p className="text-sm text-primary/70"><em>Le site web a été entièrement conçu et développé par <strong>Landry MOUTONGO</strong>.</em></p>
                </div>
              </div>
            }
          />
        )}

        {currentView === 'contact' && (
          <ContactView onNavigate={handleNavigate} />
        )}

        {currentView === 'faq' && (
          <FAQView onNavigate={handleNavigate} />
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
                <p>La livraison est gratuite pour toute commande supérieure à 200 000 FCFA.</p>
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
                <p><strong>Éditeur du site :</strong> Laine et Déco SARL</p>
                <p><strong>Siège social :</strong> Douala, Cameroun</p>
                <p><strong>Propriétaires :</strong> Landry et Doleres</p>
                <p><strong>Développement Web :</strong> Landry MOUTONGO</p>
                <p><strong>Hébergement :</strong> Google Cloud Platform</p>
                <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-red-800 font-bold mb-2">Propriété Intellectuelle</p>
                  <p className="text-red-700 text-sm">
                    Ce site et son code source sont la propriété exclusive de Landry. Toute reproduction ou utilisation sans autorisation est strictement interdite.
                  </p>
                </div>
              </div>
            }
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPolicyView onNavigate={handleNavigate} />
        )}

        {currentView === 'terms' && (
          <StaticPageView 
            title="Conditions Générales de Vente" 
            onBack={() => handleNavigate('home')}
            content={
              <div className="space-y-6">
                <p>Les présentes CGV régissent les ventes effectuées sur le site Laine et Déco.</p>
                <h2 className="text-2xl font-bold">Prix</h2>
                <p>Les prix sont indiqués en FCFA toutes taxes comprises.</p>
                <h2 className="text-2xl font-bold">Paiement</h2>
                <p>Nous acceptons les paiements par Mobile Money (Orange & MTN) et par carte bancaire.</p>
              </div>
            }
          />
        )}

        {!VALID_VIEWS.includes(currentView) && (
          <Error404View onNavigate={handleNavigate} />
        )}
        </Suspense>
      </motion.div>
    </AnimatePresence>
    
    {currentView !== 'comparison' && (
      <ComparisonTool 
        comparisonList={comparisonList} 
        onRemove={removeFromComparison} 
        onClear={() => setComparisonList([])} 
        onNavigate={handleNavigate}
      />
    )}
  </>
  );
};


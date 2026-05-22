import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader } from './Loader';
import { RouteFallback } from './RouteFallback';
import { AppLayout } from './AppLayout';

// Zustand stores
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useConfigStore } from '../../stores/configStore';

// Hooks
import { useNavigateAdapter } from '../hooks/useNavigateAdapter';
import { useProducts } from '../hooks/useProducts';
import { useEntity } from '../hooks/useEntity';

// Non-lazy components
import { StaticPageView } from './StaticPageView';

import { toast } from 'sonner';
import { Product } from '../../types';

// ── Lazy loaded views ──
const HomeView = lazy(() => import('../views/HomeView').then(m => ({ default: m.HomeView })));
const ShopView = lazy(() => import('../views/ShopView').then(m => ({ default: m.ShopView })));
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
const QRLandingView = lazy(() => import('../views/QRLandingView').then(m => ({ default: m.QRLandingView })));
const Error404View = lazy(() => import('../views/Error404View').then(m => ({ default: m.Error404View })));

// ── Route wrapper components ──
// Each wrapper reads ONLY what it needs from stores — no monolithic useSharedData

function HomePage() {
  const onNavigate = useNavigateAdapter();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const events = useConfigStore((s) => s.events);
  return (
    <HomeView
      onNavigate={onNavigate}
      onAddToCart={addToCart}
      onAddToWishlist={addToWishlist}
      onQuickView={() => {}}
      onAddToComparison={addToComparison}
      onProductClick={(p: Product) => navigate(`/product/${p.id}`)}
      siteConfig={siteConfig}
      events={events}
    />
  );
}

function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const events = useConfigStore((s) => s.events);
  return (
    <ShopView
      onAddToCart={addToCart}
      onAddToWishlist={addToWishlist}
      onQuickView={() => {}}
      onAddToComparison={addToComparison}
      onProductClick={(p: Product) => navigate(`/product/${p.id}`)}
      events={events}
      initialSearchQuery={searchParams.get('q') || ''}
    />
  );
}

function FlashSalesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const events = useConfigStore((s) => s.events);
  return (
    <ShopView
      onAddToCart={addToCart}
      onAddToWishlist={addToWishlist}
      onQuickView={() => {}}
      onAddToComparison={addToComparison}
      onProductClick={(p: Product) => navigate(`/product/${p.id}`)}
      events={events}
      initialSearchQuery={searchParams.get('q') || ''}
      flashSaleId={id}
    />
  );
}

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const events = useConfigStore((s) => s.events);
  const product = PRODUCTS.find(p => p.id === id || p.slug === id) || null;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-24 text-center"><p className="text-xl text-primary/70 font-serif">Produit introuvable.</p></div>;
  return <ProductDetailView product={product} allProducts={PRODUCTS} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={() => {}} onNavigate={onNavigate} events={events} />;
}

function CartPage() {
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const cart = useCartStore((s) => s.cart);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateCartQuantity = useCartStore((s) => s.updateCartQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  return <CartView cart={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onNavigate={onNavigate} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onQuickView={() => {}} allProducts={PRODUCTS} />;
}

function CheckoutPage() {
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const cart = useCartStore((s) => s.cart);
  const setCart = useCartStore((s) => s.setCart);
  const user = useAuthStore((s) => s.user);
  return <CheckoutView cart={cart} user={user} onNavigate={onNavigate} onComplete={() => setCart([])} allProducts={PRODUCTS} />;
}

function ComparisonPage() {
  const onNavigate = useNavigateAdapter();
  const comparisonList = useComparisonStore((s) => s.comparisonList);
  const removeFromComparison = useComparisonStore((s) => s.removeFromComparison);
  const setComparisonList = useComparisonStore((s) => s.setComparisonList);
  const addToCart = useCartStore((s) => s.addToCart);
  return <ComparisonView comparisonList={comparisonList} onRemove={removeFromComparison} onClear={() => setComparisonList([])} onNavigate={onNavigate} onAddToCart={addToCart} />;
}

function PacksPage() {
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const addToCart = useCartStore((s) => s.addToCart);
  const addPackToCart = useCartStore((s) => s.addPackToCart);
  return <PacksView onNavigate={onNavigate} onAddToCart={addToCart} onAddPackToCart={(pack: any, qty?: number) => addPackToCart(pack, PRODUCTS, qty)} />;
}

function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const addToCart = useCartStore((s) => s.addToCart);
  const addPackToCart = useCartStore((s) => s.addPackToCart);
  return <PackDetailView packId={id!} onNavigate={onNavigate} onAddToCart={addToCart} onAddPackToCart={(pack: any, qty?: number) => addPackToCart(pack, PRODUCTS, qty)} />;
}

function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const onNavigate = useNavigateAdapter();
  return <BlogPostView postId={id!} onNavigate={onNavigate} />;
}

function CalculatorPage() {
  const onNavigate = useNavigateAdapter();
  const addToCart = useCartStore((s) => s.addToCart);
  return <CalculatorView onNavigate={onNavigate} onAddToCart={addToCart} />;
}

function VolumeCalculatorPage() {
  const onNavigate = useNavigateAdapter();
  const addToCart = useCartStore((s) => s.addToCart);
  return <VolumeCalculatorView onNavigate={onNavigate} onAddToCart={addToCart} />;
}

function LookbookPage() {
  const onNavigate = useNavigateAdapter();
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  return <LookbookView onNavigate={onNavigate} products={PRODUCTS} />;
}

function PatternGeneratorPage() {
  const onNavigate = useNavigateAdapter();
  const addToCart = useCartStore((s) => s.addToCart);
  return <PatternGeneratorView onAddToCart={addToCart} onNavigate={onNavigate} />;
}

function ConfiguratorPage() {
  const addToCart = useCartStore((s) => s.addToCart);
  return <KnittingConfiguratorView onAddToCart={addToCart} />;
}

function CustomPackBuilderPage() {
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts;
  const addToCart = useCartStore((s) => s.addToCart);
  return <CustomPackBuilderView onAddToCart={addToCart} allProducts={PRODUCTS} />;
}

function WishlistPage() {
  const onNavigate = useNavigateAdapter();
  const wishlist = useWishlistStore((s) => s.wishlist);
  const setWishlist = useWishlistStore((s) => s.setWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-serif">Ma Liste de Souhaits</h1>
        {wishlist.length > 0 && (
          <button onClick={() => { navigator.clipboard.writeText(window.location.href + '?wishlist=shared'); toast.success('Lien de partage copié dans le presse-papier !'); }} className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            Partager ma liste
          </button>
        )}
      </div>
      {wishlist.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-primary/5">
          <p className="text-xl text-primary/70 font-serif italic">Votre liste est vide.</p>
          <button onClick={() => onNavigate('shop')} className="mt-4 text-accent font-bold underline">Aller faire un tour</button>
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
  );
}

function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.currentUserDoc?.role || 'customer');
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const isSuperAdminOrAdmin = ['super-admin', 'admin'].includes(userRole);
  const [orderQueryConstraints, setOrderQueryConstraints] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    void import('firebase/firestore').then(({ where }) => {
      setOrderQueryConstraints(
        isSuperAdminOrAdmin ? [] : [where('userId', '==', user?.uid || 'guest')]
      );
    });
  }, [isSuperAdminOrAdmin, user?.uid]);

  const { data: ORDERS } = useEntity<any>('order', [], {
    enabled: !isAuthLoading && orderQueryConstraints !== null,
    constraints: orderQueryConstraints ?? [],
    deps: [user?.uid, userRole, orderQueryConstraints],
  });
  const [trackingOrder, setTrackingOrder] = React.useState(id || '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-8 text-center">Suivi de Commande</h1>
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5 mb-12">
        <p className="text-center text-primary/70 mb-6">Entrez votre numéro de commande pour suivre son état en temps réel.</p>
        <div className="flex gap-4">
          <input type="text" placeholder="Ex: ORD-001" value={trackingOrder} onChange={(e) => setTrackingOrder(e.target.value.toUpperCase())} className="flex-grow px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono" />
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-colors">Suivre</button>
        </div>
      </div>
      {trackingOrder && ORDERS.find(o => o.id === trackingOrder) ? (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-primary/5">
            <div className="flex justify-between items-center mb-8">
              <div><p className="text-xs uppercase tracking-widest text-primary/70 font-bold mb-1">Commande</p><h2 className="text-2xl font-mono font-bold">{trackingOrder}</h2></div>
              <div className="text-right"><p className="text-xs uppercase tracking-widest text-primary/70 font-bold mb-1">Statut Actuel</p><span className="px-4 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest">{ORDERS.find(o => o.id === trackingOrder)?.status}</span></div>
            </div>
            <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {ORDERS.find(o => o.id === trackingOrder)?.trackingSteps?.map((step: any, i: number) => (
                <div key={i} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`} />
                  <div className="flex justify-between items-start">
                    <div><h3 className={`font-bold ${step.completed ? 'text-primary' : 'text-primary/70'}`}>{step.status}</h3><p className="text-sm text-primary/70">{step.description}</p></div>
                    <span className="text-xs font-mono text-primary/70">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : trackingOrder && (
        <div className="text-center py-12 bg-red-50 rounded-[3rem] border border-red-100"><p className="text-red-500 font-bold">Aucune commande trouvée avec ce numéro.</p></div>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const onNavigate = useNavigateAdapter();
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.currentUserDoc?.role || 'customer');
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const setSiteConfig = useConfigStore((s) => s.setSiteConfig);

  React.useEffect(() => {
    const backofficeRoles = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'];
    if (!isAuthLoading && !backofficeRoles.includes(userRole)) {
      if (!user) { onNavigate('auth'); toast.error("Veuillez vous connecter."); }
      else { onNavigate('home'); toast.error("Accès refusé."); }
    }
  }, [isAuthLoading, user, userRole]);

  if (isAuthLoading) return <Loader fullScreen text="Vérification des accès admin..." />;
  if (!user) return null;
  return <AdminDashboard onNavigate={onNavigate} siteConfig={siteConfig} setSiteConfig={setSiteConfig} user={user} isAuthLoading={isAuthLoading} />;
}

function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const onNavigate = useNavigateAdapter();
  return <AdminProductDetailView productId={id!} onNavigate={onNavigate} />;
}

function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const onNavigate = useNavigateAdapter();
  return <AdminUserDetailView userId={id!} onNavigate={onNavigate} />;
}

function CustomerDashboardPage() {
  const onNavigate = useNavigateAdapter();
  const user = useAuthStore((s) => s.user);
  return <CustomerDashboard onNavigate={onNavigate} user={user} initialTab="overview" />;
}

// ── Main Route Tree ──
export const AppRoutes: React.FC = () => {
  const onNavigate = useNavigateAdapter();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/flash-sales/:id" element={<FlashSalesPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          
          {/* Content */}
          <Route path="/blog" element={<BlogIndexView />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/team" element={<TeamView onNavigate={onNavigate} />} />
          <Route path="/about" element={<StaticPageView title="À Propos de Nous" onBack={() => {}} content={<div className="space-y-6"><p>Bienvenue chez Laine et Déco.</p></div>} />} />
          <Route path="/contact" element={<ContactView onNavigate={onNavigate} />} />
          <Route path="/faq" element={<FAQView onNavigate={onNavigate} />} />
          
          {/* Tools */}
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/volume-calculator" element={<VolumeCalculatorPage />} />
          <Route path="/care-guide" element={<CareGuideView />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/community" element={<CommunityGalleryView onNavigate={onNavigate} />} />
          <Route path="/knitting-companion" element={<KnittingCompanionView />} />
          <Route path="/pattern-generator" element={<PatternGeneratorPage />} />
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/custom-order" element={<CustomOrderView />} />
          
          {/* Packs */}
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/custom-pack" element={<CustomPackBuilderPage />} />
          <Route path="/pack/:id" element={<PackDetailPage />} />
          
          {/* Auth */}
          <Route path="/auth" element={<AuthView onNavigate={onNavigate} initialMode="login" />} />
          <Route path="/login" element={<AuthView onNavigate={onNavigate} initialMode="login" />} />
          <Route path="/signup" element={<AuthView onNavigate={onNavigate} initialMode="signup" />} />
          
          {/* Customer */}
          <Route path="/customer-dashboard" element={<CustomerDashboardPage />} />
          <Route path="/order-success" element={<OrderSuccessView onNavigate={onNavigate} />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />
          
          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPolicyView onNavigate={onNavigate} />} />
          <Route path="/legal" element={<StaticPageView title="Mentions Légales" onBack={() => {}} content={<div className="space-y-6"><p><strong>Éditeur du site :</strong> Laine et Déco SARL</p><p><strong>Siège social :</strong> Douala, Cameroun</p></div>} />} />
          <Route path="/terms" element={<StaticPageView title="Conditions Générales de Vente" onBack={() => {}} content={<div className="space-y-6"><p>Les présentes CGV régissent les ventes sur le site.</p></div>} />} />
          <Route path="/shipping" element={<StaticPageView title="Livraison" onBack={() => {}} content={<div className="space-y-6"><p>Nous livrons dans tout le Cameroun.</p></div>} />} />
          <Route path="/returns" element={<StaticPageView title="Retours et Remboursements" onBack={() => {}} content={<div className="space-y-6"><p>Votre satisfaction est notre priorité.</p></div>} />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/product/:id" element={<AdminProductDetailPage />} />
          <Route path="/admin/user/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin-logs" element={<AdminLogsView onNavigate={onNavigate} />} />
          
          {/* Special */}
          <Route path="/qr-landing" element={<QRLandingView onNavigate={onNavigate} />} />
          <Route path="/invite/:code" element={<Navigate to="/" replace />} />
          
          {/* 404 Catch-all */}
          <Route path="*" element={<Error404View onNavigate={onNavigate} />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

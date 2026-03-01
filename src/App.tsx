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
import { Product, SiteConfig } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from './constants';
import { ChatBubble } from './components/ChatBubble';
import { Toast, ToastType } from './components/Toast';
import { QuickViewModal } from './components/QuickViewModal';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) setSelectedId(id);
  };

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
              />
            )}
            {currentView === 'shop' && (
              <ShopView 
                onAddToCart={(p) => addToCart(p)}
                onAddToWishlist={addToWishlist}
                onQuickView={setQuickViewProduct}
                onProductClick={handleProductClick}
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
                      <div key={p.id} className="relative group">
                        <img src={p.image} alt={p.name} className="aspect-[3/4] object-cover rounded-3xl" referrerPolicy="no-referrer" />
                        <div className="mt-4">
                          <h3 className="font-serif text-lg">{p.name}</h3>
                          <p className="font-bold">{p.price.toLocaleString()} FCFA</p>
                        </div>
                        <button 
                          onClick={() => setWishlist(prev => prev.filter(item => item.id !== p.id))}
                          className="absolute top-4 right-4 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdminView && <Footer onNavigate={handleNavigate} />}
      {!isAdminView && <ChatBubble />}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
      />
    </div>
  );
}

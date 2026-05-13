import { useState, useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Product, SiteConfig, PromoEvent, CartItem, Pack } from '../../types';
import { SITE_CONFIG as INITIAL_SITE_CONFIG, PACKS as INITIAL_PACKS, PRODUCTS as INITIAL_PRODUCTS, NAV_ITEMS } from '../../constants';
import { useEntity } from './useEntity';
import { useProducts } from './useProducts';
import { updateSEOMeta } from '../utils/siteUtils';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../backend/firebase';

import { logActivity } from '../utils/logger';

export const useAppLogic = () => {
  const { data: siteConfigs } = useEntity<SiteConfig>('site_config', [INITIAL_SITE_CONFIG]);
  const SITE_CONFIG = siteConfigs[0] || INITIAL_SITE_CONFIG;
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS;
  const { data: PACKS } = useEntity<any>('pack', INITIAL_PACKS);
  const { data: navItems } = useEntity<any>('nav_item', NAV_ITEMS);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    return viewParam || 'home';
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<string>('');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized.");
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    // Safety timeout: if auth doesn't respond in 5 seconds, stop loading
    const timeout = setTimeout(() => {
      setIsAuthLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Detect invite link
    if (window.location.pathname.startsWith('/invite/')) {
      const inviteCode = window.location.pathname.split('/invite/')[1];
      if (inviteCode) {
        sessionStorage.setItem('referralCode', inviteCode);
        sonnerToast.info("Lien de parrainage activé ! Vous recevrez une réduction sur votre première commande.");
        // Redirect to home without changing the state drastically if needed
        window.history.replaceState({}, '', '/');
        setCurrentView('home');
      }
    }
  }, []);

  useEffect(() => {
    setSiteConfig(SITE_CONFIG);
  }, [SITE_CONFIG]);
  const [events, setEvents] = useState<PromoEvent[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else sonnerToast.info(message);
  };

  useEffect(() => {
    if (currentView === 'product-detail' && selectedId) {
      const product = PRODUCTS.find(p => p.id === selectedId || p.slug === selectedId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [currentView, selectedId, PRODUCTS]);

  const handleNavigate = (view: string, id?: string, query?: string) => {
    setIsLoading(true);
    const start = Date.now();
    setTimeout(() => {
      setCurrentView(view);
      const url = new URL(window.location.href);
      if (view === 'home') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.replaceState({}, '', url.toString());

      if (id) {
        setSelectedId(id);
        if (view === 'order-tracking') {
          setTrackingOrder(id);
        }
      } else if (view === 'order-tracking') {
        setTrackingOrder('');
      }
      if (query) setInitialSearchQuery(query);
      else if (view !== 'shop') setInitialSearchQuery('');
      setIsLoading(false);
      
      // Log activity to Firestore
      logActivity('GET', view, 200, Date.now() - start, user?.uid);
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
      const title = selectedProduct.seo?.title || `${selectedProduct.name} - Atelier de Doleres`;
      const desc = selectedProduct.seo?.description || selectedProduct.description;
      updateSEOMeta(title, desc, selectedProduct.image);
    }
  }, [currentView, selectedProduct, siteConfig]);

  // Listen for push notifications
  useEffect(() => {
    const handlePushNotification = (event: CustomEvent) => {
      const notif = event.detail;
      sonnerToast(notif.title, {
        description: notif.message,
        duration: 5000,
        action: {
          label: 'Voir',
          onClick: () => {
             if (notif.type === 'order') handleNavigate('order-tracking');
             else if (notif.type === 'stock') handleNavigate('shop');
             else handleNavigate('customer-dashboard');
          }
        }
      });
    };

    window.addEventListener('push-notification' as any, handlePushNotification);
    return () => window.removeEventListener('push-notification' as any, handlePushNotification);
  }, [handleNavigate]);

  // Listen for auth-required event
  useEffect(() => {
    const handleAuthRequired = () => {
      showToast("Vous devez être connecté pour effectuer cette action.", 'error');
      handleNavigate('login');
    };

    window.addEventListener('auth-required' as any, handleAuthRequired);
    return () => window.removeEventListener('auth-required' as any, handleAuthRequired);
  }, [handleNavigate]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const calculatePackPrice = (pack: Pack) => {
    const subtotal = pack.products.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    return subtotal * (1 - pack.discountPercentage / 100);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.type === 'product' && item.product?.id === product.id);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        const currentItem = newCart[existingIndex];
        newCart[existingIndex] = { 
          ...currentItem, 
          quantity: currentItem.quantity + quantity 
        };
        return newCart;
      }
      return [...prev, { 
        id: product.id, 
        type: 'product', 
        product, 
        quantity, 
        price: product.price 
      }];
    });
    showToast(`${product.name} ajouté au panier !`);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
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

  const addToComparison = (product: Product) => {
    setComparisonList(prev => {
      if (prev.find(p => p.id === product.id)) {
        showToast(`${product.name} est déjà dans la liste de comparaison`, 'info');
        return prev;
      }
      if (prev.length >= 3) {
        showToast(`Vous ne pouvez comparer que 3 produits à la fois`, 'error');
        return prev;
      }
      showToast(`${product.name} ajouté au comparatif !`);
      return [...prev, product];
    });
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(prev => prev.filter(p => p.id !== id));
  };

  const addPackToCart = (pack: Pack, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.type === 'pack' && item.pack?.id === pack.id);
      const packPrice = calculatePackPrice(pack);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        const currentItem = newCart[existingIndex];
        newCart[existingIndex] = { 
          ...currentItem, 
          quantity: currentItem.quantity + quantity 
        };
        return newCart;
      }
      return [...prev, { 
        id: pack.id, 
        type: 'pack', 
        pack, 
        quantity, 
        price: packPrice 
      }];
    });
    showToast(`Pack ${pack.name} ajouté au panier !`);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  return {
    showInstallBanner,
    setShowInstallBanner,
    currentView,
    selectedId,
    cart,
    wishlist,
    comparisonList,
    isLoading,
    trackingOrder,
    setTrackingOrder,
    initialSearchQuery,
    selectedProduct,
    quickViewProduct,
    setQuickViewProduct,
    siteConfig,
    setSiteConfig,
    events,
    navItems,
    handleNavigate,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    addToWishlist,
    addToComparison,
    removeFromComparison,
    addPackToCart,
    handleProductClick,
    setCart,
    setWishlist,
    setComparisonList,
    user,
    isAuthLoading
  };
};

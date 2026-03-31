import { useState, useEffect } from 'react';
import { Product, SiteConfig, Language, Currency, PromoEvent } from '../types';
import { SITE_CONFIG, LANGUAGES, CURRENCIES, PRODUCTS } from '../constants';
import { updateSEOMeta } from '../utils/siteUtils';
import { toast as sonnerToast } from 'sonner';

export const useAppNavigation = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [trackingOrder, setTrackingOrder] = useState<string>('');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [events, setEvents] = useState<PromoEvent[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else sonnerToast.info(message);
  };

  const handleNavigate = (view: string, id?: string, query?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentView(view);
      if (id) setSelectedId(id);
      if (query) setInitialSearchQuery(query);
      else if (view !== 'shop') setInitialSearchQuery('');
      setIsLoading(false);
    }, 600);
  };

  useEffect(() => {
    if (selectedId && (currentView === 'product-detail' || currentView === 'pack-detail')) {
      if (currentView === 'product-detail') {
        const product = PRODUCTS.find(p => p.id === selectedId);
        if (product) setSelectedProduct(product);
      }
    }
  }, [selectedId, currentView]);

  useEffect(() => {
    const seo = siteConfig.seo;
    if (currentView === 'home') updateSEOMeta(seo.home.title, seo.home.description, seo.home.ogImage);
    else if (currentView === 'shop') updateSEOMeta(seo.shop.title, seo.shop.description, seo.shop.ogImage);
    else if (currentView === 'contact') updateSEOMeta(seo.contact.title, seo.contact.description, seo.contact.ogImage);
    else if (currentView === 'about') updateSEOMeta(seo.about.title, seo.about.description, seo.about.ogImage);
    else if (currentView === 'product-detail' && selectedProduct) {
      updateSEOMeta(selectedProduct.seo?.title || `${selectedProduct.name} - Laine & Déco`, selectedProduct.seo?.description || selectedProduct.description, selectedProduct.image);
    }
  }, [currentView, selectedProduct, siteConfig]);

  useEffect(() => { window.scrollTo(0, 0); }, [currentView]);

  return {
    currentView, setCurrentView,
    selectedId, setSelectedId,
    cart, setCart,
    wishlist, setWishlist,
    isLoading, setIsLoading,
    language, setLanguage,
    currency, setCurrency,
    trackingOrder, setTrackingOrder,
    initialSearchQuery, setInitialSearchQuery,
    selectedProduct, setSelectedProduct,
    quickViewProduct, setQuickViewProduct,
    siteConfig, setSiteConfig,
    events, setEvents,
    handleNavigate, showToast
  };
};

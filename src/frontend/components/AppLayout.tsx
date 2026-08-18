import React, { Suspense, lazy, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import { Navbar, Footer } from './Layout';
import { TopMarquee } from './TopMarquee';
import { CartAnimation } from './CartAnimation';
import { MobileGlassDock } from './MobileGlassDock';
import { MobileGlassHeader } from './MobileGlassHeader';

import { ChatBubble } from './ChatBubble';
const InstallBanner = lazy(() => import('./InstallBanner').then((m) => ({ default: m.InstallBanner })));
const ComparisonTool = lazy(() => import('./ComparisonTool').then((m) => ({ default: m.ComparisonTool })));
import { ErrorBoundary } from './ErrorBoundary';
import { updateSEOMeta } from '../utils/siteUtils';

import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useConfigStore } from '../../stores/configStore';
import { useThemeStore } from '../../stores/themeStore';
import { useNavigateAdapter } from '../hooks/useNavigateAdapter';

/**
 * AppLayout — wraps all public pages with Navbar + Footer.
 * Also runs global side-effects (SEO, push notifications, invite links).
 * Reads directly from Zustand stores (no props needed).
 */
export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavigate = useNavigateAdapter();

  // ── Zustand selectors (granular to avoid unnecessary re-renders) ──
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.currentUserDoc?.role || 'customer');
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const comparisonList = useComparisonStore((s) => s.comparisonList);
  const removeFromComparison = useComparisonStore((s) => s.removeFromComparison);
  const clearComparison = useComparisonStore((s) => s.clearComparison);
  const siteConfig = useConfigStore((s) => s.siteConfig);

  const [showInstallBanner, setShowInstallBanner] = React.useState(false);
  const [deferredWidgets, setDeferredWidgets] = React.useState(false);
  const [chatMounted, setChatMounted] = React.useState(false);

  React.useEffect(() => {
    const run = () => {
      setDeferredWidgets(true);
      setShowInstallBanner(true);
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: 8000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, 6000);
    return () => clearTimeout(t);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = location.pathname.startsWith('/admin');

  // Derive currentView from pathname for Navbar active state
  const currentView = React.useMemo(() => {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (path === '/') return 'home';
    if (path.startsWith('/product/')) return 'product-detail';
    if (path.startsWith('/admin')) return 'admin-dashboard';
    if (path.startsWith('/pack/')) return 'pack-detail';
    if (path.startsWith('/blog/')) return 'blog-post';
    return path.substring(1);
  }, [location.pathname]);

  // ── Scroll to top on route change ──
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ── Mobile Landscape Orientation detector & notifier ──
  useEffect(() => {
    let lastState = window.innerWidth < 768 && window.innerWidth > window.innerHeight;
    
    const handleResize = () => {
      const currentState = window.innerWidth < 768 && window.innerWidth > window.innerHeight;
      if (currentState && !lastState) {
        sonnerToast("Mode paysage activé 📱", {
          description: "L'affichage s'est adapté pour vous offrir un confort optimal.",
          duration: 4000,
        });
      }
      lastState = currentState;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // ── SEO Meta Tags (updates on each route change) ──
  useEffect(() => {
    const seoConfig = (siteConfig?.seo as any)?.[currentView] || siteConfig?.seo?.home;
    if (seoConfig) {
      updateSEOMeta(seoConfig.title, seoConfig.description, seoConfig.ogImage);
    }
  }, [currentView, siteConfig]);

  // ── Legacy ?view= redirect ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('view')) {
      const v = params.get('view')!;
      const id = params.get('id') || undefined;
      params.delete('view');
      if (id) params.delete('id');
      handleNavigate(v, id);
    }
  }, [location.search]);

  // ── Invite link detection ──
  useEffect(() => {
    if (location.pathname.startsWith('/invite/')) {
      const inviteCode = location.pathname.split('/invite/')[1];
      if (inviteCode) {
        sessionStorage.setItem('referralCode', inviteCode);
        sonnerToast.info("Lien de parrainage activé ! Vous recevrez une réduction sur votre première commande.");
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname]);

  // ── Push notifications listener ──
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

  // ── Auth-required listener ──
  useEffect(() => {
    const handleAuthRequired = () => {
      sonnerToast.error("Vous devez être connecté pour effectuer cette action.");
      handleNavigate('login');
    };
    window.addEventListener('auth-required' as any, handleAuthRequired);
    return () => window.removeEventListener('auth-required' as any, handleAuthRequired);
  }, [handleNavigate]);

  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen bg-secondary text-primary font-sans transition-colors duration-300"
      style={!isDark && siteConfig?.primaryColor ? {
        '--primary-color': siteConfig.primaryColor,
        '--accent-color': siteConfig?.accentColor || '#5C6B5A',
      } as React.CSSProperties : {}}
    >
      <a href="#main-content" className="sr-only">
        Aller au contenu principal
      </a>
      <CartAnimation cartCount={cartCount} />
      {showInstallBanner && (
        <Suspense fallback={null}>
          <InstallBanner showInstallBanner={showInstallBanner} setShowInstallBanner={setShowInstallBanner} />
        </Suspense>
      )}
      
      {!isAdmin && <TopMarquee siteConfig={siteConfig} />}
      {!isAdmin && (
        <MobileGlassHeader
          onNavigate={handleNavigate}
          user={user}
        />
      )}
      {!isAdmin && (
        <Navbar 
          onNavigate={handleNavigate}
          currentView={currentView}
          cartCount={cartCount}
          wishlistCount={wishlist.length}
          user={user}
          userRole={userRole}
          comparisonList={comparisonList}
        />
      )}

      {isAdmin ? (
        <ErrorBoundary onNavigate={handleNavigate}>
          <Outlet />
        </ErrorBoundary>
      ) : (
        <main id="main-content" className="relative min-h-[calc(100vh-200px)] pb-24 md:pb-0">
          <ErrorBoundary onNavigate={handleNavigate}>
            <Outlet />
          </ErrorBoundary>
        </main>
      )}

      {!isAdmin && (
        <MobileGlassDock
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          wishlistCount={wishlist.length}
          user={user}
        />
      )}

      {!isAdmin && <Footer onNavigate={handleNavigate} user={user} />}
      {!isAdmin && <ChatBubble />}

      {/* Floating comparison tool */}
      {currentView !== 'comparison' && comparisonList.length > 0 && deferredWidgets && (
        <Suspense fallback={null}>
          <ComparisonTool
            comparisonList={comparisonList}
            onRemove={removeFromComparison}
            onClear={clearComparison}
            onNavigate={handleNavigate}
          />
        </Suspense>
      )}
    </div>
  );
};

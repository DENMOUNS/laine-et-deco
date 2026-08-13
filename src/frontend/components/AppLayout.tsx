import React, { Suspense, lazy, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';
import { Navbar, Footer } from './Layout';
import { TopMarquee } from './TopMarquee';
import { CartAnimation } from './CartAnimation';
import { MobileGlassDock } from './MobileGlassDock';
import { MobileGlassHeader } from './MobileGlassHeader';

const InstallBanner = lazy(() => import('./InstallBanner').then((m) => ({ default: m.InstallBanner })));
const ChatBubble = lazy(() => import('./ChatBubble').then((m) => ({ default: m.ChatBubble })));
const ComparisonTool = lazy(() => import('./ComparisonTool').then((m) => ({ default: m.ComparisonTool })));
import { ErrorBoundary } from './ErrorBoundary';
import { updateSEOMeta } from '../utils/siteUtils';

import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useConfigStore } from '../../stores/configStore';
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

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] text-primary font-sans"
      style={{
        '--primary-color': siteConfig?.primaryColor || '#2C3E35',
        '--accent-color': siteConfig?.accentColor || '#D6B4A3',
      } as React.CSSProperties}
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
      {!isAdmin && deferredWidgets && (
        <Suspense fallback={null}>
          {chatMounted ? (
            <ChatBubble startOpen />
          ) : (
            <button
              type="button"
              aria-label="Ouvrir l’assistant de chat"
              onClick={() => setChatMounted(true)}
              className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[80] glass-ios text-primary dark:text-white p-3.5 sm:p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative group"
            >
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-sm" aria-hidden="true" />
              <span className="sr-only">Chat</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
          )}
        </Suspense>
      )}

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

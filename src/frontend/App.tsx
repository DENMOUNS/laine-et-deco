import React from 'react';
import { Navbar, Footer } from './components/Layout';
import { MainContent } from './components/MainContent';
import { InstallBanner } from './components/InstallBanner';
import { ChatBubble } from './components/ChatBubble';
import { useAppLogic } from './hooks/useAppLogic';
import { Toaster } from 'sonner';
import { QRLandingView } from './views/QRLandingView';

import { TopMarquee } from './components/TopMarquee';
import { CartAnimation } from './components/CartAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  const appLogic = useAppLogic();

  if (appLogic.currentView === 'qr-landing') {
    return (
      <div 
        className={`min-h-screen bg-[#FDFBF7] text-[#2C3E35] font-sans ${appLogic.siteConfig?.theme === 'dark' ? 'dark' : ''}`}
        style={{
          '--primary-color': appLogic.siteConfig?.primaryColor || '#2C3E35',
          '--accent-color': appLogic.siteConfig?.accentColor || '#D6B4A3',
        } as React.CSSProperties}>
         <Toaster position="top-center" />
         <QRLandingView onNavigate={appLogic.handleNavigate} />
      </div>
    );
  }

  const cartCount = appLogic.cart.reduce((acc, item) => acc + item.quantity, 0);
  const isPortfolio = appLogic.currentView?.startsWith('portfolio-');
  const isAdmin = appLogic.currentView?.startsWith('admin-');
  const hideGlobalNav = isPortfolio || isAdmin;

  return (
    <div 
      className={`min-h-screen bg-[#FDFBF7] text-primary font-sans ${appLogic.siteConfig?.theme === 'dark' ? 'dark' : ''}`}
      style={{
        '--primary-color': appLogic.siteConfig?.primaryColor || '#2C3E35',
        '--accent-color': appLogic.siteConfig?.accentColor || '#D6B4A3',
      } as React.CSSProperties}>
      <Toaster position="top-center" />
      <CartAnimation cartCount={cartCount} />
      {appLogic.showInstallBanner && <InstallBanner showInstallBanner={appLogic.showInstallBanner} setShowInstallBanner={appLogic.setShowInstallBanner} />}
      {!hideGlobalNav && <TopMarquee siteConfig={appLogic.siteConfig} />}
      {!hideGlobalNav && (
        <Navbar 
          onNavigate={appLogic.handleNavigate} 
          currentView={appLogic.currentView} 
          cartCount={cartCount}
          wishlistCount={appLogic.wishlist.length}
          user={appLogic.user}
          comparisonList={appLogic.comparisonList}
          navItems={appLogic.navItems}
        />
      )}
      {hideGlobalNav ? (
        <ErrorBoundary onNavigate={appLogic.handleNavigate}>
          <MainContent {...appLogic} />
        </ErrorBoundary>
      ) : (
        <main className="min-h-[calc(100vh-200px)]">
          <ErrorBoundary onNavigate={appLogic.handleNavigate}>
            <MainContent {...appLogic} />
          </ErrorBoundary>
        </main>
      )}
      {!hideGlobalNav && <Footer onNavigate={appLogic.handleNavigate} />}
      {!hideGlobalNav && <ChatBubble />}
    </div>
  );
}

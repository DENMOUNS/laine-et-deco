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
import { SplashScreen } from './components/SplashScreen';

export function App() {
  const appLogic = useAppLogic();

  if (appLogic.currentView === 'qr-landing') {
    return (
      <div className={`min-h-screen bg-[#FDFBF7] text-[#2C3E35] font-sans ${appLogic.siteConfig?.theme === 'dark' ? 'dark' : ''}`}>
         <Toaster position="top-center" />
         <QRLandingView onNavigate={appLogic.handleNavigate} />
      </div>
    );
  }

  const cartCount = appLogic.cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen bg-[#FDFBF7] text-[#2C3E35] font-sans ${appLogic.siteConfig?.theme === 'dark' ? 'dark' : ''}`}>
      <SplashScreen />
      <Toaster position="top-center" />
      <CartAnimation cartCount={cartCount} />
      {appLogic.showInstallBanner && <InstallBanner showInstallBanner={appLogic.showInstallBanner} setShowInstallBanner={appLogic.setShowInstallBanner} />}
      <TopMarquee siteConfig={appLogic.siteConfig} />
      <Navbar 
        onNavigate={appLogic.handleNavigate} 
        currentView={appLogic.currentView} 
        cartCount={cartCount}
        wishlistCount={appLogic.wishlist.length}
        user={appLogic.user}
        comparisonList={appLogic.comparisonList}
        navItems={appLogic.navItems}
      />
      <main className="min-h-[calc(100vh-200px)]">
        <MainContent {...appLogic} />
      </main>
      <Footer onNavigate={appLogic.handleNavigate} />
      <ChatBubble />
    </div>
  );
}

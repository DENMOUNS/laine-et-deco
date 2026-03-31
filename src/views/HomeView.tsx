import React from 'react';
import { CATEGORIES, PRODUCTS, BLOG_POSTS } from '../constants';
import { Product, SiteConfig, PromoEvent } from '../types';
import { AdBanner } from '../components/AdBanner';
import { HomeHero } from './Home/HomeHero';
import { HomeFeatures } from './Home/HomeFeatures';
import { HomeFlashSale } from './Home/HomeFlashSale';
import { HomeCalculators } from './Home/HomeCalculators';
import { HomeGiftBox } from './Home/HomeGiftBox';
import { HomeCategories } from './Home/HomeCategories';
import { HomeFeaturedProducts } from './Home/HomeFeaturedProducts';
import { HomeBlog } from './Home/HomeBlog';

interface HomeViewProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  siteConfig: SiteConfig;
  events?: PromoEvent[];
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigate, onAddToCart, onAddToWishlist, onQuickView, onProductClick, 
  siteConfig, events = [] 
}) => {
  const featuredProducts = PRODUCTS.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));
  const flashSaleProduct = PRODUCTS.find(p => p.isSale) || PRODUCTS[0];

  return (
    <div className="space-y-24 pb-24">
      <AdBanner />
      
      <HomeHero siteConfig={siteConfig} onNavigate={onNavigate} />

      <HomeFeatures />

      <HomeFlashSale product={flashSaleProduct} onNavigate={onNavigate} />

      <HomeCalculators onNavigate={onNavigate} />

      <HomeGiftBox onNavigate={onNavigate} />

      <HomeCategories 
        categories={featuredCategories.length > 0 ? featuredCategories : CATEGORIES.slice(0, 3)} 
        onNavigate={onNavigate} 
      />

      <HomeFeaturedProducts 
        products={featuredProducts.length > 0 ? featuredProducts : PRODUCTS.slice(0, 4)}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        onQuickView={onQuickView}
        onProductClick={onProductClick}
        events={events}
      />

      <HomeBlog posts={BLOG_POSTS.slice(0, 3)} onNavigate={onNavigate} />
    </div>
  );
};

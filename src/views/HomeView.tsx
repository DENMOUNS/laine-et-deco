import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Package, Truck, ShieldCheck, Heart, Calendar, User } from 'lucide-react';
import { CATEGORIES, PRODUCTS, BLOG_POSTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Product, SiteConfig } from '../types';
import { AdBanner } from '../components/AdBanner';

interface HomeViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  siteConfig: SiteConfig;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onAddToCart, onAddToWishlist, onQuickView, onProductClick, siteConfig }) => {
  const [showOnlyPromos, setShowOnlyPromos] = React.useState(false);
  const featuredProducts = PRODUCTS.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));

  return (
    <div className="space-y-24 pb-24">
      <AdBanner />
      
      {/* Hero Section */}
      {siteConfig.showSlider && (
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={siteConfig.sliderItems[0].image}
              alt="Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white"
            >
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-4 text-accent">{siteConfig.sliderItems[0].subtitle}</span>
              <h1 className="text-6xl md:text-8xl font-serif leading-tight mb-8">
                {siteConfig.sliderItems[0].title.split(' ').slice(0, 2).join(' ')} <br />
                <span className="italic">&</span> {siteConfig.sliderItems[0].title.split(' ').slice(2).join(' ')}
              </h1>
              <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
                Découvrez notre sélection de laines naturelles et d'objets de décoration pour un intérieur qui vous ressemble.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('shop')}
                  className="bg-white text-primary px-10 py-4 rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center group"
                >
                  Découvrir la boutique
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="border border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-all duration-300">
                  Nos inspirations
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary/30 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Produit Vedette</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Laine Mérinos <br/> Extra Fine</h2>
              <p className="text-primary/60 text-lg">Une douceur incomparable pour vos créations les plus précieuses. Disponible en 12 coloris naturels.</p>
              <div className="flex items-center gap-6">
                <span className="text-3xl font-bold text-primary">8 200 FCFA</span>
                <button 
                  onClick={() => onNavigate('shop')}
                  className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-all shadow-lg"
                >
                  Acheter maintenant
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img 
                  src="https://picsum.photos/seed/merino-slider/800/800" 
                  alt="Featured" 
                  className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Package size={32} />, title: "Qualité Premium", desc: "Laines 100% naturelles" },
            { icon: <Truck size={32} />, title: "Livraison Rapide", desc: "Offerte dès 50€ d'achat" },
            { icon: <ShieldCheck size={32} />, title: "Paiement Sécurisé", desc: "Transaction 100% protégée" },
            { icon: <Heart size={32} />, title: "Fait avec Amour", desc: "Sélection artisanale" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-primary/5"
            >
              <div className="text-accent mb-4">{feature.icon}</div>
              <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-primary/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Explorer</span>
            <h2 className="text-4xl font-serif">Nos Catégories</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(featuredCategories.length > 0 ? featuredCategories : CATEGORIES.slice(0, 3)).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer"
              onClick={() => onNavigate('shop')}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">{cat.count} Articles</p>
                <h3 className="text-3xl font-serif mb-4">{cat.name}</h3>
                <span className="inline-flex items-center text-sm font-bold group-hover:text-accent transition-colors">
                  Découvrir <ArrowRight size={16} className="ml-2" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Sélection</span>
              <h2 className="text-4xl font-serif mb-4">Les Incontournables</h2>
              <p className="text-primary/60 max-w-xl">Nos meilleures ventes et coups de cœur du moment, choisis avec soin pour vous.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-primary/5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-4">Filtre:</span>
              <button 
                onClick={() => setShowOnlyPromos(!showOnlyPromos)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${showOnlyPromos ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-primary/60 hover:bg-slate-100'}`}
              >
                {showOnlyPromos ? 'Toutes les promos' : 'En promotion'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(showOnlyPromos 
              ? PRODUCTS.filter(p => p.oldPrice)
              : (featuredProducts.length > 0 ? featuredProducts : PRODUCTS.slice(0, 4))
            ).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onQuickView={onQuickView}
                onClick={onProductClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Coussins & Plaids Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Confort</span>
            <h2 className="text-4xl font-serif">Coussins & Plaids</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir la collection
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.filter(p => p.category === 'Coussins & Plaids').slice(0, 4).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              onClick={onProductClick}
            />
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Inspirations</span>
            <h2 className="text-4xl font-serif">Derniers Articles</h2>
          </div>
          <button onClick={() => onNavigate('blog')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout le blog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {BLOG_POSTS.slice(0, 2).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onNavigate('blog-post', post.id)}
            >
              <div className="aspect-[16/9] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-primary/40">
                  <span className="text-accent">{post.category}</span>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {post.date}</div>
                </div>
                <h3 className="text-2xl font-serif group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="text-primary/60 line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center font-bold text-primary group-hover:text-accent transition-colors">
                  Lire la suite <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Custom Sections */}
      {siteConfig.customSections.map((section) => (
        <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif">{section.title}</h2>
            <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
              Voir tout
            </button>
          </div>
          
          {section.type === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.filter(p => section.itemIds.includes(p.id)).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onQuickView={onQuickView}
                  onClick={onProductClick}
                />
              ))}
            </div>
          )}

          {section.type === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORIES.filter(c => section.itemIds.includes(c.id)).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer"
                  onClick={() => onNavigate('shop')}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">{cat.count} Articles</p>
                    <h3 className="text-3xl font-serif mb-4">{cat.name}</h3>
                    <span className="inline-flex items-center text-sm font-bold group-hover:text-accent transition-colors">
                      Découvrir <ArrowRight size={16} className="ml-2" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Newsletter / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Rejoignez la communauté Laine&Déco</h2>
            <p className="text-white/70 mb-10 text-lg">Recevez 10% de réduction sur votre première commande et restez informé de nos nouveaux arrivages.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-grow bg-white/10 border border-white/20 rounded-full px-8 py-4 focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all duration-300">
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

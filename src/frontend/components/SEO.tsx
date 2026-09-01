import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  lang?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Laine & Déco - Laine de Luxe, Tricot & Décoration Artisanale',
  description = 'Boutique en ligne d\'exception pour la laine premium, matériel de tricot, accessoires de crochet et décoration artisanale haut de gamme.',
  keywords = 'laine, tricot, crochet, mercerie, pelotes, laine mérinos, décoration artisanale, Cameroun, Afrique',
  ogImage = '/logo.png',
  ogType = 'website',
  canonicalUrl,
  lang = 'fr',
}) => {
  const fullTitle = title.includes('Laine & Déco') ? title : `${title} | Laine & Déco`;

  return (
    <Helmet htmlAttributes={{ lang }}>
      {/* Balises standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

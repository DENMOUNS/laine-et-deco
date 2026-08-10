export const updateSEOMeta = (title: string, description: string, ogImage?: string) => {
  document.title = title;
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = description;
    document.head.appendChild(meta);
  }

  if (ogImage) {
    const metaOgImage = document.querySelector('meta[property="og:image"]');
    if (metaOgImage) {
      metaOgImage.setAttribute('content', ogImage);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = ogImage;
      document.head.appendChild(meta);
    }
  }
};

export const getEffectivePrice = (product: any, events: any[]) => {
  // Si le produit est en promotion et a un prix promotionnel valide
  if (product.promoPrice && product.promoPrice > 0 && product.promoPrice < (product.price || 0)) {
    return product.promoPrice;
  }
  
  // Sinon retourner le prix normal
  return product.price;
};

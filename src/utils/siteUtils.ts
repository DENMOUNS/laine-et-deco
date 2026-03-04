import { Product, PromoEvent } from '../types';

/**
 * Calculates the effective price of a product considering active events.
 */
export const getEffectivePrice = (product: Product, events: PromoEvent[]): number => {
  const now = new Date();
  
  // Find active events that apply to this product
  const activeEvents = events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const isActive = now >= start && now <= end && event.status === 'active';
    
    if (!isActive) return false;
    
    if (event.applyToAll) return true;
    
    return event.productIds?.includes(product.id);
  });

  // If multiple events apply, we'll take the highest discount for simplicity
  if (activeEvents.length > 0) {
    const maxDiscount = Math.max(...activeEvents.map(e => e.discountPercentage));
    return product.price * (1 - maxDiscount / 100);
  }

  // If no event applies, check if there's a promoPrice set manually
  if (product.promoPrice) {
    return product.promoPrice;
  }

  return product.price;
};

/**
 * Updates SEO meta tags dynamically
 */
export const updateSEOMeta = (title: string, description: string, ogImage?: string) => {
  document.title = title;
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Open Graph
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];
  if (ogImage) ogTags.push({ property: 'og:image', content: ogImage });

  ogTags.forEach(tag => {
    let element = document.querySelector(`meta[property="${tag.property}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', tag.property);
      document.head.appendChild(element);
    }
    element.setAttribute('content', tag.content);
  });
};

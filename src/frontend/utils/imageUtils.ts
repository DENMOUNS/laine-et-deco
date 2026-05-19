/** Optimise les URLs Unsplash pour LCP (WebP, taille, qualité). */
export function optimizeImageUrl(url: string, width = 960): string {
  if (!url || url.startsWith('data:') || url.endsWith('.mp4')) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('unsplash.com')) {
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', '75');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('fm', 'webp');
      return parsed.toString();
    }
  } catch {
    /* URL relative ou invalide */
  }

  return url;
}

const LOCAL_IMAGE_PLACEHOLDER = '/icons/icon-192.png';

export function optimizeImageUrl(url: string, _width = 960): string {
  if (!url || url.startsWith('data:') || url.endsWith('.mp4')) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('unsplash.com')) {
      return LOCAL_IMAGE_PLACEHOLDER;
    }
  } catch {
    /* URL relative ou invalide */
  }

  return url;
}

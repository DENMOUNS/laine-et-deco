/**
 * Image Policy utility.
 * Pass-through: allows all valid image URLs (including Unsplash, Firebase, external URLs)
 * without replacing them with missing placeholders.
 */

export const sanitizeImageSrc = (value: string | null | undefined): string | null | undefined => {
  return value;
};

export function installImagePolicy(): void {
  // No-op: do not block or patch image URLs.
}

/** Avatar en data-URL (aucune requête réseau) si la photo Google / externe échoue. */
export function initialsAvatarDataUri(displayName: string | null | undefined, size = 96): string {
  const raw = displayName?.trim() || '?';
  const letter = raw.slice(0, 1).toUpperCase();
  const safe = letter.replace(/[<>&'"]/g, '?');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect fill="#e8ebe7" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#3E4A3D" font-family="system-ui,sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="700">${safe}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

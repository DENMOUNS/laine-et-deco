import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

/** Generates a beautiful inline SVG Data URI with initial badge taking 1st letter of first word & 1st letter of last word. */
export function generateSvgPlaceholder(label: string = 'Laine & Déco'): string {
  const cleanLabel = (label || 'Laine & Déco').trim();
  const words = cleanLabel.split(/\s+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    initials = (firstWord[0] + lastWord[0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else {
    initials = cleanLabel.slice(0, 2).toUpperCase() || 'LD';
  }

  const safeInitials = initials.replace(/[<>&'"]/g, '');
  const safeLabel = cleanLabel.replace(/[<>&'"]/g, '').slice(0, 24);

  const colors = [
    ['#2C3E35', '#1E2B25'], // Deep Sage Forest
    ['#5C3D46', '#3D282E'], // Muted Terracotta Rose
    ['#3B4E68', '#263447'], // Elegant Slate Blue
    ['#7A5C3E', '#4E3A26'], // Warm Cognac / Clay
    ['#4A3B52', '#2E2434'], // Deep Velvet
    ['#385A55', '#213A36'], // Deep Pine
  ];

  let hash = 0;
  for (let i = 0; i < cleanLabel.length; i++) {
    hash = cleanLabel.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorPair = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="bg_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair[0]}" />
        <stop offset="100%" stop-color="${colorPair[1]}" />
      </linearGradient>
      <radialGradient id="glow_${Math.abs(hash)}" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow_${Math.abs(hash)}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="600" height="600" fill="url(#bg_${Math.abs(hash)})" />
    <rect width="600" height="600" fill="url(#glow_${Math.abs(hash)})" />
    
    <circle cx="300" cy="250" r="150" fill="none" stroke="white" stroke-opacity="0.06" stroke-width="2" />
    <circle cx="300" cy="250" r="110" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="1.5" stroke-dasharray="6 6" />

    <circle cx="300" cy="250" r="85" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.3" stroke-width="2" filter="url(#shadow_${Math.abs(hash)})" />
    <text x="300" y="272" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Playfair Display', Georgia, serif" font-size="64" font-weight="700" letter-spacing="2">${safeInitials}</text>

    <rect x="50" y="460" width="500" height="76" rx="16" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.15" />
    <text x="300" y="506" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="600" letter-spacing="0.5">${safeLabel}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Image',
  className = 'w-12 h-12 rounded-lg object-cover',
  fallbackClassName,
  onError,
  onLoad,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const placeholderUri = generateSvgPlaceholder(alt);

  // If no src or error, render placeholder directly
  if (!src || hasError) {
    return (
      <img
        src={placeholderUri}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden inline-block ${className || ''}`} style={{ background: `url("${placeholderUri}") center/cover no-repeat` }}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          setHasError(true);
          if (onError) onError(e);
        }}
        {...props}
      />
    </div>
  );
};

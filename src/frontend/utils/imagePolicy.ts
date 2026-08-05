const LOCAL_IMAGE_PLACEHOLDER = '/icons/icon-192.png';

const isBlockedImageUrl = (value: string) => {
  if (!value) return false;
  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.hostname.includes('unsplash.com') || parsed.pathname.includes('/photo-');
  } catch {
    return value.includes('unsplash.com') || value.includes('/photo-');
  }
};

export const sanitizeImageSrc = (value: string | null | undefined) => {
  if (!value) return value;
  return isBlockedImageUrl(value) ? LOCAL_IMAGE_PLACEHOLDER : value;
};

export function installImagePolicy() {
  if (typeof window === 'undefined') return;

  const win = window as any;
  if (win.__laineEtDecoImagePolicyInstalled) return;
  win.__laineEtDecoImagePolicyInstalled = true;

  const sanitizeElement = (img: HTMLImageElement) => {
    const currentSrc = img.getAttribute('src');
    const sanitized = sanitizeImageSrc(currentSrc);
    if (sanitized && sanitized !== currentSrc) {
      console.info('[image-policy]', {
        message: 'blocked-image-src',
        originalSrc: currentSrc,
        replacementSrc: sanitized,
      });
      img.setAttribute('src', sanitized);
    }
  };

  const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (srcDescriptor?.set && srcDescriptor?.get) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      enumerable: srcDescriptor.enumerable,
      get() {
        return srcDescriptor.get!.call(this);
      },
      set(value: string) {
        return srcDescriptor.set!.call(this, sanitizeImageSrc(value));
      },
    });
  }

  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function patchedSetAttribute(name: string, value: string) {
    if (this instanceof HTMLImageElement && name.toLowerCase() === 'src') {
      return originalSetAttribute.call(this, name, sanitizeImageSrc(value) || '');
    }
    return originalSetAttribute.call(this, name, value);
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLImageElement) {
        sanitizeElement(mutation.target);
      }
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          sanitizeElement(node);
        } else if (node instanceof Element) {
          node.querySelectorAll('img').forEach((img) => sanitizeElement(img));
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['src'],
    childList: true,
    subtree: true,
  });

  document.querySelectorAll('img').forEach((img) => sanitizeElement(img));
}

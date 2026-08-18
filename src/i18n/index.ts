import { useLanguageStore, Language } from '../stores/languageStore';
import { fr } from './fr';
import { en } from './en';

const dictionaries = {
  fr,
  en,
};

export type TranslationKey = string;

/**
 * Access a nested string value by dot-notation (e.g. 'common.home')
 */
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Hook to use translations in components
 */
export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (path: string, params?: Record<string, string | number>): string => {
    const currentDict = dictionaries[language] || dictionaries.fr;
    let text = getNestedValue(currentDict, path);

    // Fallback to French if not found in English
    if (!text && language !== 'fr') {
      text = getNestedValue(dictionaries.fr, path);
    }

    if (!text) {
      // Return last part of path as fallback label
      const parts = path.split('.');
      return parts[parts.length - 1] || path;
    }

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  /**
   * Helper to get localized attribute from an entity (e.g. product.name_en or product.name)
   */
  const l = <T extends Record<string, any>>(
    item: T | null | undefined,
    field: string,
    fallback = ''
  ): string => {
    return getLocalized(item, field, language, fallback);
  };

  return {
    t,
    l,
    language,
    setLanguage,
    toggleLanguage,
    isEn: language === 'en',
    isFr: language === 'fr',
  };
}

/**
 * Standalone helper to extract localized value from an item object
 */
export function getLocalized<T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  language: Language = 'fr',
  fallback = ''
): string {
  if (!item) return fallback;

  if (language === 'en') {
    const enVal = item[`${field}_en`] ?? item[`${field}En`] ?? item[`${field}_EN`];
    if (typeof enVal === 'string' && enVal.trim() !== '') {
      return enVal;
    }
  }

  const frVal = item[field] ?? item[`${field}_fr`];
  if (typeof frVal === 'string' && frVal.trim() !== '') {
    return frVal;
  }

  if (frVal !== undefined && frVal !== null) {
    return String(frVal);
  }

  return fallback;
}

export { fr, en };

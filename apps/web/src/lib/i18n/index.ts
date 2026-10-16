import { en, TranslationDictionary } from './dictionaries/en';
import { hi } from './dictionaries/hi';
import { mr } from './dictionaries/mr';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageMeta } from './types';

export * from './types';
export { en, hi, mr };
export type { TranslationDictionary };

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
  mr,
};

/**
 * Resolve a dot-notated string key from dictionary (e.g. 'nav.dashboard')
 */
export function getTranslation(
  lang: SupportedLanguage,
  key: string,
  fallback?: string
): string {
  const dict = dictionaries[lang] || dictionaries.en;
  const parts = key.split('.');

  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === 'string' && current.trim().length > 0) {
    return current;
  }

  // Fallback to English dictionary if target language doesn't have it
  if (lang !== 'en') {
    let enCurrent: any = dictionaries.en;
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
        enCurrent = enCurrent[part];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (typeof enCurrent === 'string' && enCurrent.trim().length > 0) {
      return enCurrent;
    }
  }

  return fallback !== undefined ? fallback : key;
}

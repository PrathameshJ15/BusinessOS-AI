export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  badge: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeName: 'English', badge: 'EN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', badge: 'HI' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', badge: 'MR' },
];

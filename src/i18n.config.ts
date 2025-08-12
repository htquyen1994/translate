export type InterpolationMethod = 'template-strings' | 'regex' | 'auto';

export interface I18nConfig {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  assetsPath?: string;
  languageSupports?: string[];
  interpolationMethod?: InterpolationMethod;
}

export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  assetsPath: './assets/i18n',
  languageSupports: ['en'],
  interpolationMethod: 'auto' // auto = template-strings with regex fallback
};
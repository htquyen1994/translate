export type Language = string;

export interface TranslationData {
  [key: string]: string;
}

export interface EventTranslateLoad {
  lang: Language;
  data: TranslationData;
}

export interface InterpolatedValueResult {
  strings: TemplateStringsArray;
  values: any[];
}

export class TranslationError extends Error {
  constructor(message: string, public lang?: Language, public key?: string) {
    super(message);
    this.name = 'TranslationError';
  }
}

export class UnsupportedLanguageError extends TranslationError {
  constructor(lang: Language, supportedLanguages: Language[]) {
    super(`Language "${lang}" is not supported. Supported languages: ${supportedLanguages.join(', ')}`, lang);
    this.name = 'UnsupportedLanguageError';
  }
}
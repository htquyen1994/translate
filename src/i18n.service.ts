import { catchError, finalize, isObservable, Observable, of, shareReplay, Subject, take, takeUntil } from "rxjs";
import { EventTranslateLoad, InterpolatedValueResult, Language, TranslationData, TranslationError, UnsupportedLanguageError } from "./translate.type";
import { Inject, Injectable, OnDestroy, Optional } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { I18nConfig, DEFAULT_I18N_CONFIG } from "./i18n.config";

export abstract class I18nTranslate implements OnDestroy {
  abstract readonly languageSupports: Language[];
  abstract readonly currentLang: Language;
  abstract readonly config: I18nConfig;
  abstract readonly isLoadingResource: boolean;
  abstract readonly onLangChange$: Observable<EventTranslateLoad>;
  
  abstract setLanguage(lang: Language): Promise<void>;
  abstract setLanguageSupport(langs: Language[]): void;
  abstract getLanguageSupport(): Language[];
  abstract getCurrentLang(): Language;
  abstract get(key: string, ...values: any[]): string;
  abstract hasTranslation(key: string, lang?: Language): boolean;
  abstract ngOnDestroy(): void;
}

@Injectable()
export class I18nTranslateImplement extends I18nTranslate implements OnDestroy {
  private _languageSupports: Language[] = ['vn'];
  private _currentLang!: Language;
  private _translationRequests: Record<Language, Observable<TranslationData>> = {};
  private _onLangChange = new Subject<EventTranslateLoad>();
  private _destroy$ = new Subject<void>();
  private _storeLanguage = new Map<Language, TranslationData>();
  private _config!: I18nConfig;
  private _isLoadingResource = false;

  get languageSupports(): Language[] {
    return [...this._languageSupports];
  }

  get currentLang(): Language {
    return this._currentLang;
  }

  get config(): I18nConfig {
    return this._config;
  }

  get isLoadingResource(): boolean {
    return this._isLoadingResource;
  }

  get onLangChange$(): Observable<EventTranslateLoad> {
    return this._onLangChange.asObservable();
  }

  constructor(
    private httpClient: HttpClient,
    @Optional() @Inject('I18N_CONFIG') i18nConfig?: I18nConfig
  ) {
    super();
    this._config = { ...DEFAULT_I18N_CONFIG, ...i18nConfig };
    
    const defaultLanguage = this._config.defaultLanguage!;
    const supportedLanguages = this._config.languageSupports || [defaultLanguage];
    
    if (!supportedLanguages.includes(defaultLanguage)) {
      throw new UnsupportedLanguageError(defaultLanguage, supportedLanguages);
    }
    
    this.setLanguageSupport(supportedLanguages);
    this.setLanguage(defaultLanguage).catch(error => {
      console.error('Failed to initialize default language:', error);
    });
  }

  public async setLanguage(lang: Language): Promise<void> {
    if (!this._languageSupports.includes(lang)) {
      throw new UnsupportedLanguageError(lang, this._languageSupports);
    }
    
    this._currentLang = lang;
    const requestObservable = this._loadTranslateRequestCache(lang);
    
    if (isObservable(requestObservable)) {
      return new Promise((resolve, reject) => {
        requestObservable.pipe(
          takeUntil(this._destroy$),
          catchError(error => {
            console.error(`Failed to load translations for ${lang}:`, error);
            return of({});
          })
        ).subscribe({
          next: (data: TranslationData) => {
            this._storeLanguage.set(lang, data);
            this._changeLang(lang);
            resolve();
          },
          error: reject
        });
      });
    }
    
    this._changeLang(lang);
  }

  public setLanguageSupport(langs: Language[]): void {
    if (!langs?.length) {
      throw new TranslationError('Language supports cannot be empty');
    }
    this._languageSupports = [...langs];
  }

  public getLanguageSupport(): Language[] {
    return [...this._languageSupports];
  }

  public getCurrentLang(): Language {
    return this._currentLang;
  }

  public get(key: string, ...values: any[]): string {
    const translations = this._storeLanguage.get(this._currentLang);
    if (!translations) {
      console.warn(`No translations loaded for language "${this._currentLang}"`);
      return key;
    }
    
    const translation = this._getTranslationKeyData(translations, key);
    if (!translation) {
      const fallbackLang = this._config.fallbackLanguage;
      if (fallbackLang && fallbackLang !== this._currentLang) {
        const fallbackTranslations = this._storeLanguage.get(fallbackLang);
        const fallbackTranslation = fallbackTranslations ? this._getTranslationKeyData(fallbackTranslations, key) : null;
        if (fallbackTranslation) {
          return values.length ? this._interpolate(fallbackTranslation, values) : fallbackTranslation;
        }
      }
      console.warn(`Translation key "${key}" not found for language "${this._currentLang}"`);
      return key;
    }
    
    return values.length ? this._interpolate(translation, values) : translation;
  }

  private _loadTranslateRequestCache(lang: Language): Observable<TranslationData> | undefined {
    if (!this._storeLanguage.has(lang)) {
      this._isLoadingResource = true;
      this._translationRequests[lang] = this._translationRequests[lang] || this._loadTranslateAssetResources(lang).pipe(
        finalize(() => { this._isLoadingResource = false; }),
        shareReplay(1)
      );
      return this._translationRequests[lang];
    }
    return undefined;
  }

  private _loadTranslateAssetResources(lang: Language): Observable<TranslationData> {
    const url = `${this._config.assetsPath}/${lang}.json`;
    return this.httpClient.get<TranslationData>(url).pipe(
      take(1),
      catchError(error => {
        throw new TranslationError(`Failed to load translation file: ${url}`, lang);
      })
    );
  }

  private _changeLang(lang: Language): void {
    const data = this._storeLanguage.get(lang) ?? {};
    this._onLangChange.next({ lang, data });
  }

  private _getTranslationKeyData(data: TranslationData, key: string): string | null {
    return data[key] ?? null;
  }

  private _interpolate(text: string, valueParams: any[]): string {
    if (!valueParams.length) return text;
    
    const { strings, values } = this._parseInterpolatedTemplate(text, valueParams);
    return this._templateTag(strings, ...values);
  }

  private _templateTag(strings: TemplateStringsArray, ...values: any[]): string {
    let result = strings[0] || '';
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      result += (value !== null && value !== undefined ? String(value) : `{{${i}}}`) + (strings[i + 1] || '');
    }
    return result;
  }

  private _parseInterpolatedTemplate(textTranslate: string, params: any[]): InterpolatedValueResult {
    const segments: string[] = [];
    const values: any[] = [];
    let lastIndex = 0;

    textTranslate.replace(/\{\{(\d+)\}\}/g, (match, paramIndex, offset) => {
      segments.push(textTranslate.slice(lastIndex, offset));
      const index = parseInt(paramIndex, 10);
      values.push(params[index]);
      lastIndex = offset + match.length;
      return match;
    });

    segments.push(textTranslate.slice(lastIndex));
    const strings = Object.assign(segments, { raw: segments }) as TemplateStringsArray;
    return { strings, values };
  }

  public hasTranslation(key: string, lang?: Language): boolean {
    const targetLang = lang || this._currentLang;
    const translations = this._storeLanguage.get(targetLang);
    return translations ? this._getTranslationKeyData(translations, key) !== null : false;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._onLangChange.complete();
  }
}
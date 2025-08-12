import { catchError, finalize, from, isObservable, map, Observable, of, shareReplay, startWith, Subject, switchMap, take, takeUntil } from "rxjs";
import { EventTranslateLoad, InterpolatedValueResult, Language, TranslationData, TranslationError, UnsupportedLanguageError } from "./translate.type";
import { Inject, Injectable, OnDestroy, Optional, Signal, toSignal } from "@angular/core";
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
  abstract get$(key: string, ...values: any[]): Observable<string>;
  abstract getSignal(key: string, ...values: any[]): Signal<string>;
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
  
  // Global loading promise
  private _currentLoadingPromise: Promise<void> | null = null;

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
      const loadingPromise = new Promise<void>((resolve, reject) => {
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
          error: (err) => {
            reject(err);
          }
        });
      });
      
      this._currentLoadingPromise = loadingPromise; // Store globally
      
      // Clear promise after completion (both success and error)
      loadingPromise.finally(() => {
        this._currentLoadingPromise = null;
      });
      
      return loadingPromise;
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
    return this._getTranslationText(key, this._currentLang, this._storeLanguage, values);
  }

  public get$(key: string, ...values: any[]): Observable<string> {
    // Check if currently loading
    if (this._isLoadingResource && this._currentLoadingPromise) {
      // Wait for loading completion, then provide translations
      return from(this._currentLoadingPromise).pipe(
        switchMap(() => this._onLangChange.pipe(
          map(() => this._getTranslationText(key, this._currentLang, this._storeLanguage, values)),
          startWith(this._getTranslationText(key, this._currentLang, this._storeLanguage, values))
        )),
        takeUntil(this._destroy$)
      );
    }
    
    // Normal flow when not loading
    return this._onLangChange.pipe(
      map(() => this._getTranslationText(key, this._currentLang, this._storeLanguage, values)),
      startWith(this._getTranslationText(key, this._currentLang, this._storeLanguage, values)),
      takeUntil(this._destroy$)
    );
  }

  public getSignal(key: string, ...values: any[]): Signal<string> {
    // Convert get$() Observable to Signal using toSignal()
    const translationSignal = toSignal(this.get$(key, ...values), {
      initialValue: key // Fallback to key while loading
    });
    
    return translationSignal;
  }

  private _getTranslationText(
    key: string, 
    currentLang: Language, 
    translationsStore: Map<Language, TranslationData>,
    values: any[]
  ): string {
    const translations = translationsStore.get(currentLang);
    
    // Try current language first
    if (translations) {
      const translation = this._getTranslationKeyData(translations, key);
      if (translation) {
        return values.length ? this._interpolate(translation, values) : translation;
      }
    }
    
    // Try fallback language if current language failed or not loaded
    const fallbackResult = this._tryFallbackTranslation(key, currentLang, translationsStore, values);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    // Return key if no translation found
    return key;
  }

  private _tryFallbackTranslation(
    key: string,
    currentLang: Language,
    translationsStore: Map<Language, TranslationData>,
    values: any[]
  ): string | null {
    const fallbackLang = this._config.fallbackLanguage;
    
    // No fallback language configured or same as current
    if (!fallbackLang || fallbackLang === currentLang) {
      return null;
    }
    
    // Check if fallback translations are loaded
    const fallbackTranslations = translationsStore.get(fallbackLang);
    if (!fallbackTranslations) {
      return null;
    }
    
    // Try to get translation from fallback language
    const fallbackTranslation = this._getTranslationKeyData(fallbackTranslations, key);
    if (!fallbackTranslation) {
      return null;
    }
    
    return values.length ? this._interpolate(fallbackTranslation, values) : fallbackTranslation;
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

  private _changeLang(lang: Language): void {
    const data = this._storeLanguage.get(lang) ?? {};
    this._onLangChange.next({ lang, data });
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
    this._currentLoadingPromise = null; // Clear loading promise
  }
}
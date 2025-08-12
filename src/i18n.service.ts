import { catchError, finalize, isObservable, map, Observable, of, shareReplay, Subject, take } from "rxjs";
import { EventTranslateLoad, I18nConfig, InterpolatedValueParameter, InterpolatedValueResult, Language, TranslationData } from "./translate.type";
import { Inject, Injectable, Optional, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export abstract class I18nTranslate {
  abstract languageSupports: Language[];
  abstract currentLang: Language;
  abstract config: I18nConfig;
  abstract isLoadingResource: boolean;
  
  abstract setLanguage(lang: Language): void;
  abstract setLanguageSupport(langs: Language[]): void;
  abstract getLanguageSupport(): Language[];
  abstract getCurrentLang(): Language;
  abstract get(key: string, ...values: any[]): string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nTranslateImplement extends I18nTranslate {
  languageSupports: Language[] = ['vn'];
  currentLang!: Language;
  private _translationRequests: Record<Language, Observable<TranslationData>> = {};
  private _onLangChange: Subject<EventTranslateLoad> = new Subject<EventTranslateLoad>();
  _storeLanguage = new Map<Language, TranslationData>();
  config!: I18nConfig;
  isLoadingResource = false;

  constructor(
    private httpClient: HttpClient,
    @Optional() @Inject('I18N_CONFIG') public i18nConfig: I18nConfig
  ) {
    super();
    if (!i18nConfig) i18nConfig = DEFAULT_I18N_CONFIG;
    this.config = i18nConfig;
    
    const defaultLanguage = this.config.defaultLanguage || 'en';
    if (!this.config.languageSupports.includes(defaultLanguage)) {
      throw Error("This language is not supported");
    }
    
    this.setLanguageSupport(this.config.languageSupports || [[]]);
    this.setLanguage(defaultLanguage);
  }

  public setLanguage(lang: Language) {
    if (!this.languageSupports.includes(lang)) {
      throw Error("This language is not supported");
    }
    
    this.currentLang = lang;
    const requestGetResourcesLoaded = this._loadTranslateRequestCache(lang);
    
    if (isObservable(requestGetResourcesLoaded)) {
      requestGetResourcesLoaded.pipe(
        catchError(error => {
          console.error(`Failed to load translate ${lang}:`, error);
          return of({});
        })
      ).subscribe((data: TranslationData) => {
        this._storeLanguage.set(lang, data);
        this.changeLang(lang);
      });
    }
  }

  setLanguageSupport(langs: Language[]) {
    this.languageSupports = langs;
  }

  getLanguageSupport(): Language[] {
    return this.languageSupports;
  }

  getCurrentLang() {
    return this.currentLang;
  }

  get(key: string, ...values: any[]) {
    const translations = this._storeLanguage.get(this.currentLang) || {};
    let translation = this.getTranslationKeyData(translations || {}, key);
    
    if (!translation) {
      console.warn(`Translation key "${key}" not found for language "${this.currentLang}"`);
      return key;
    }
    
    return values ? this.interpolate(translation, values) : translation;
  }

  private _loadTranslateRequestCache(lang: Language) {
    if (!this._storeLanguage.has(lang)) {
      this.isLoadingResource = true;
      this._translationRequests[lang] = this._translationRequests[lang] || this.loadTranslateAssetResources(lang);
      this._translationRequests[lang].pipe(
        finalize(() => { this.isLoadingResource = false; })
      );
      return this._translationRequests[lang];
    }
    return undefined;
  }

  private loadTranslateAssetResources(lang: Language) {
    return this.httpClient.get<TranslationData>(`${this.config.assetsUrl}/${lang}.json`)
      .pipe(shareReplay(1), take(1));
  }

  private changeLang(lang: Language): void {
    const data = this._storeLanguage.has(lang) ? this._storeLanguage.get(lang) : {};
    this._onLangChange.next({
      lang: lang,
      data: data ?? {}
    });
  }

  private getTranslationKeyData(data: TranslationData, key: string): string | null {
    if (key in data) return data[key];
    return null;
  }

  private interpolate(text: string, ...valueParams: any[]): string {
    const templateTag = (strings: TemplateStringsArray, ...values: any[]): string => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += String(values[i] ?? `{{${i}}}`) + (strings[i + 1] || '');
      }
      return result;
    };

    const { strings, values } = this.parseInterpolatedTemplate(text, valueParams);
    return templateTag(strings, ...values);
  }

  private parseInterpolatedTemplate(textTranslate: string, params?: any[]): InterpolatedValueResult {
    if (!params) {
      return {
        strings: Object.assign([textTranslate], { raw: [textTranslate] }) as TemplateStringsArray,
        values: []
      };
    }

    const segments: string[] = [];
    const values: any[] = [];
    let lastIndex = 0;

    textTranslate.replace(/\{\{(\d+)\}\}/g, (match, param, offset) => {
      segments.push(textTranslate.slice(lastIndex, offset));
      values.push(params[param]);
      lastIndex = offset + match.length;
      return match;
    });

    const strings = Object.assign(segments, { raw: segments }) as TemplateStringsArray;
    return { strings, values };
  }
}
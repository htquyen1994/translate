import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { I18nConfig, DEFAULT_I18N_CONFIG, InterpolationMethod } from './i18n.config';

export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translations: Map<string, TranslationObject> = new Map();
  private currentLang$ = new BehaviorSubject<string>(this.config.defaultLanguage || 'en');
  private loadedLanguages: Set<string> = new Set();

  public onLangChange$ = this.currentLang$.asObservable();

  constructor(
    private http: HttpClient,
    @Optional() @Inject('I18N_CONFIG') private config: I18nConfig = DEFAULT_I18N_CONFIG
  ) {
    this.setLanguage(this.config.defaultLanguage || 'en');
  }

  setLanguage(lang: string): Observable<TranslationObject> {
    if (this.translations.has(lang)) {
      this.currentLang$.next(lang);
      return of(this.translations.get(lang)!);
    }

    return this.loadLanguage(lang).pipe(
      tap(() => this.currentLang$.next(lang))
    );
  }

  loadLanguage(lang: string): Observable<TranslationObject> {
    if (this.loadedLanguages.has(lang)) {
      return of(this.translations.get(lang)!);
    }

    const url = `${this.config.assetsPath}/${lang}.json`;
    
    return this.http.get<TranslationObject>(url).pipe(
      tap(translations => {
        this.translations.set(lang, translations);
        this.loadedLanguages.add(lang);
      }),
      catchError(error => {
        console.error(`Failed to load language ${lang}:`, error);
        return of({});
      })
    );
  }

  get(key: string, params?: { [key: string]: any } | any[]): Observable<string> {
    return this.currentLang$.pipe(
      map(currentLang => {
        const translations = this.translations.get(currentLang);
        let translation = this.getTranslation(translations || {}, key);
        
        if (!translation && this.config.fallbackLanguage && currentLang !== this.config.fallbackLanguage) {
          const fallbackTranslations = this.translations.get(this.config.fallbackLanguage);
          translation = this.getTranslation(fallbackTranslations || {}, key);
        }
        
        if (!translation) {
          console.warn(`Translation key "${key}" not found for language "${currentLang}"`);
          return key;
        }
        
        return params ? this.interpolate(translation, params) : translation;
      })
    );
  }

  instant(key: string, params?: { [key: string]: any } | any[]): string {
    const currentLang = this.currentLang$.value;
    const translations = this.translations.get(currentLang);
    let translation = this.getTranslation(translations || {}, key);
    
    if (!translation && this.config.fallbackLanguage && currentLang !== this.config.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.config.fallbackLanguage);
      translation = this.getTranslation(fallbackTranslations || {}, key);
    }
    
    if (!translation) {
      console.warn(`Translation key "${key}" not found for language "${currentLang}"`);
      return key;
    }
    
    return params ? this.interpolate(translation, params) : translation;
  }

  getCurrentLanguage(): string {
    return this.currentLang$.value;
  }

  getLoadedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }

  getInterpolationMethod(): string {
    return this.config.interpolationMethod || 'auto';
  }

  setInterpolationMethod(method: InterpolationMethod): void {
    this.config.interpolationMethod = method;
  }

  // Tagged template function for direct use (synchronous)
  template = (strings: TemplateStringsArray, ...values: any[]): string => {
    // Get current language translations
    const translations = this.translations.get(this.currentLang$.value) || {};
    
    // Build the interpolated string
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      let value = values[i];
      
      // If value is a translation key, translate it
      if (typeof value === 'string' && value.includes('.')) {
        const translatedValue = this.getTranslation(translations, value);
        if (translatedValue) {
          value = translatedValue;
        }
      }
      
      result += String(value) + (strings[i + 1] || '');
    }
    
    return result;
  };

  // Reactive tagged template function (returns Observable)
  template$ = (strings: TemplateStringsArray, ...values: any[]): Observable<string> => {
    return this.currentLang$.pipe(
      map(() => {
        // Get current language translations
        const translations = this.translations.get(this.currentLang$.value) || {};
        
        // Build the interpolated string
        let result = strings[0];
        for (let i = 0; i < values.length; i++) {
          let value = values[i];
          
          // If value is a translation key, translate it
          if (typeof value === 'string' && value.includes('.')) {
            const translatedValue = this.getTranslation(translations, value);
            if (translatedValue) {
              value = translatedValue;
            }
          }
          
          result += String(value) + (strings[i + 1] || '');
        }
        
        return result;
      })
    );
  };

  // Advanced tagged template with context (synchronous)
  tt = (context?: { [key: string]: any }) => {
    return (strings: TemplateStringsArray, ...values: any[]): string => {
      const translations = this.translations.get(this.currentLang$.value) || {};
      
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        let value = values[i];
        
        // Handle different value types
        if (typeof value === 'string') {
          // Check if it's a translation key
          const translatedValue = this.getTranslation(translations, value);
          if (translatedValue) {
            // Apply context if available
            value = context ? this.interpolate(translatedValue, context) : translatedValue;
          }
        } else if (typeof value === 'function') {
          // Execute function with context
          value = value(context || {});
        }
        
        result += String(value) + (strings[i + 1] || '');
      }
      
      return result;
    };
  };

  // Reactive advanced tagged template with context (returns Observable)
  tt$ = (context?: { [key: string]: any }) => {
    return (strings: TemplateStringsArray, ...values: any[]): Observable<string> => {
      return this.currentLang$.pipe(
        map(() => {
          const translations = this.translations.get(this.currentLang$.value) || {};
          
          let result = strings[0];
          for (let i = 0; i < values.length; i++) {
            let value = values[i];
            
            // Handle different value types
            if (typeof value === 'string') {
              // Check if it's a translation key
              const translatedValue = this.getTranslation(translations, value);
              if (translatedValue) {
                // Apply context if available
                value = context ? this.interpolate(translatedValue, context) : translatedValue;
              }
            } else if (typeof value === 'function') {
              // Execute function with context
              value = value(context || {});
            }
            
            result += String(value) + (strings[i + 1] || '');
          }
          
          return result;
        })
      );
    };
  };

  // Debug method to test both interpolation methods
  testInterpolation(text: string, params: { [key: string]: any } | any[]): {
    templateStrings: string;
    regex: string;
    current: string;
  } {
    let templateStringsResult = text;
    let regexResult = text;
    
    try {
      templateStringsResult = this.interpolateWithTemplateStrings(text, params);
    } catch (error: any) {
      templateStringsResult = `Error: ${error.message}`;
    }
    
    try {
      regexResult = this.interpolateWithRegex(text, params);
    } catch (error: any) {
      regexResult = `Error: ${error.message}`;
    }
    
    return {
      templateStrings: templateStringsResult,
      regex: regexResult,
      current: this.interpolate(text, params)
    };
  }

  private getTranslation(translations: TranslationObject, key: string): string | null {
    const keys = key.split('.');
    let current: any = translations;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }

  private interpolate(text: string, params: { [key: string]: any } | any[]): string {
    const method = this.config.interpolationMethod || 'auto';
    
    switch (method) {
      case 'template-strings':
        return this.interpolateWithTemplateStrings(text, params);
        
      case 'regex':
        return this.interpolateWithRegex(text, params);
        
      case 'auto':
      default:
        // Use template strings method by default, fallback to regex method
        try {
          return this.interpolateWithTemplateStrings(text, params);
        } catch (error) {
          console.warn('Template strings interpolation failed, using regex fallback:', error);
          return this.interpolateWithRegex(text, params);
        }
    }
  }

  private interpolateWithTemplateStrings(text: string, params: { [key: string]: any } | any[]): string {
    // Use Tagged Template approach for better performance and safety
    if (Array.isArray(params)) {
      return this.interpolateIndexedTemplate(text, params);
    } else {
      return this.interpolateNamedTemplate(text, params);
    }
  }

  private interpolateIndexedTemplate(text: string, params: any[]): string {
    // Tagged template function for indexed parameters {{0}}, {{1}}
    const templateTag = (strings: TemplateStringsArray, ...values: any[]): string => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += String(values[i] ?? `{{${i}}}`) + (strings[i + 1] || '');
      }
      return result;
    };

    // Convert {{0}}, {{1}} to template literal format
    const segments: string[] = [];
    const values: any[] = [];
    let lastIndex = 0;

    text.replace(/\{\{(\d+)\}\}/g, (match, index, offset) => {
      const idx = parseInt(index, 10);
      segments.push(text.slice(lastIndex, offset));
      values.push(params[idx]);
      lastIndex = offset + match.length;
      return match;
    });

    segments.push(text.slice(lastIndex));

    // Create TemplateStringsArray-like object
    const strings = Object.assign(segments, { raw: segments }) as TemplateStringsArray;
    
    return templateTag(strings, ...values);
  }

  private interpolateNamedTemplate(text: string, params: { [key: string]: any }): string {
    // Tagged template function for named parameters ${variable}, {{variable}}
    const templateTag = (strings: TemplateStringsArray, ...values: any[]): string => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += String(values[i] ?? `\${param${i}}`) + (strings[i + 1] || '');
      }
      return result;
    };

    // Extract all variable references
    const variables: string[] = [];
    const segments: string[] = [];
    let lastIndex = 0;

    // Handle both ${variable} and {{variable}} patterns
    const pattern = /(\$\{(\w+)\}|\{\{(\w+)\}\})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const varName = match[2] || match[3]; // Get variable name from either capture group
      segments.push(text.slice(lastIndex, match.index));
      variables.push(varName);
      lastIndex = match.index + match[0].length;
    }

    segments.push(text.slice(lastIndex));

    // Get values for variables
    const values = variables.map(varName => {
      const value = params[varName];
      return value !== undefined ? value : `\${${varName}}`;
    });

    // Create TemplateStringsArray-like object
    const strings = Object.assign(segments, { raw: segments }) as TemplateStringsArray;
    
    return templateTag(strings, ...values);
  }

  private interpolateWithRegex(text: string, params: { [key: string]: any } | any[]): string {
    // Original regex-based interpolation method (fallback)
    if (Array.isArray(params)) {
      // Handle {{0}}, {{1}}, etc. format
      return text.replace(/\{\{(\d+)\}\}/g, (match, index) => {
        const idx = +index;
        return idx < params.length && params[idx] != null ? String(params[idx]) : match;
      });
    } else {
      // Handle both ${variable} and {{variable}} formats for object parameters
      return text
        .replace(/\$\{(\w+)\}/g, (match, variableName) => {
          const value = params[variableName];
          return value !== undefined ? String(value) : match;
        })
        .replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
          const value = params[variableName];
          return value !== undefined ? String(value) : match;
        });
    }
  }
}
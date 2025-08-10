type LanguageData = { [key: string]: string };
type Variables = { [key: string]: string | number };

class I18n {
  private currentLanguage: string = 'en';
  private languageCache: Map<string, LanguageData> = new Map();
  private isNode: boolean = typeof window === 'undefined';

  async loadLanguage(langCode: string): Promise<void> {
    if (this.languageCache.has(langCode)) {
      return;
    }

    try {
      let data: LanguageData;
      
      if (this.isNode) {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'locales', `${langCode}.json`);
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        data = JSON.parse(fileContent);
      } else {
        const response = await fetch(`./locales/${langCode}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load language file: ${langCode}`);
        }
        data = await response.json();
      }

      this.languageCache.set(langCode, data);
    } catch (error) {
      console.error(`Error loading language ${langCode}:`, error);
      throw error;
    }
  }

  setLanguage(langCode: string): void {
    this.currentLanguage = langCode;
  }

  t(key: string, variables?: Variables): string {
    const languageData = this.languageCache.get(this.currentLanguage);
    
    if (!languageData) {
      console.warn(`Language ${this.currentLanguage} not loaded. Use loadLanguage() first.`);
      return key;
    }

    let translation = languageData[key];
    
    if (!translation) {
      console.warn(`Translation key "${key}" not found for language "${this.currentLanguage}"`);
      return key;
    }

    if (variables) {
      translation = this.interpolateVariables(translation, variables);
    }

    return translation;
  }

  private interpolateVariables(template: string, variables: Variables): string {
    return template.replace(/\$\{(\w+)\}/g, (match, variableName) => {
      const value = variables[variableName];
      return value !== undefined ? String(value) : match;
    });
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getLoadedLanguages(): string[] {
    return Array.from(this.languageCache.keys());
  }

  clearCache(): void {
    this.languageCache.clear();
  }
}

export default I18n;
export { I18n };
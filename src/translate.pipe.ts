import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastParams: any;
  private lastValue: string = '';
  private onLangChange?: Subscription;

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(key: string, params?: { [key: string]: any } | any[]): string {
    if (!key) return key;

    // Check if we need to update subscription
    if (!this.onLangChange) {
      this.subscribe();
    }

    // Return cached value if key and params haven't changed
    if (key === this.lastKey && this.areParamsEqual(params, this.lastParams)) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.lastValue = this.i18nService.instant(key, params);

    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  private subscribe(): void {
    this.onLangChange = this.i18nService.onLangChange$.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }

  private areParamsEqual(params1: any, params2: any): boolean {
    if (params1 === params2) return true;
    if (!params1 && !params2) return true;
    if (!params1 || !params2) return false;
    
    const keys1 = Object.keys(params1);
    const keys2 = Object.keys(params2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => params1[key] === params2[key]);
  }
}
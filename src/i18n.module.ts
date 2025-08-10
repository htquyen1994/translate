import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { I18nService } from './i18n.service';
import { TranslatePipe } from './translate.pipe';
import { I18nConfig } from './i18n.config';

@NgModule({
  declarations: [
    TranslatePipe
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    TranslatePipe
  ]
})
export class I18nModule {
  static forRoot(config?: I18nConfig): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        I18nService,
        {
          provide: 'I18N_CONFIG',
          useValue: config
        }
      ]
    };
  }

  static forChild(): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: []
    };
  }
}
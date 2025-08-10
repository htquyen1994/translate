import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { I18nModule } from '../i18n.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    I18nModule.forRoot({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      assetsPath: './assets/i18n'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
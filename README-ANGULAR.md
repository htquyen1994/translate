# Angular I18n Module

Module Angular đơn giản để hỗ trợ đa ngôn ngữ, lấy cảm hứng từ ngx-translate nhưng đơn giản hơn.

## Cấu trúc

```
src/
├── i18n.config.ts         # Configuration interface
├── i18n.service.ts        # Core service
├── translate.pipe.ts      # Angular pipe
├── i18n.module.ts         # Angular module
├── public-api.ts          # Public exports
├── assets/i18n/           # Language files
│   ├── en.json
│   └── vi.json
└── example/               # Demo components
    ├── app.component.ts
    └── app.module.ts
```

## Cài đặt trong Angular Project

### 1. Copy files vào project

```bash
# Copy thư mục src vào project Angular của bạn
cp -r src/ your-angular-project/src/lib/
```

### 2. Import module trong app.module.ts

```typescript
import { I18nModule } from './lib/i18n.module';

@NgModule({
  imports: [
    I18nModule.forRoot({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      assetsPath: './assets/i18n'
    })
  ]
})
export class AppModule { }
```

### 3. Tạo language files

**src/assets/i18n/en.json:**
```json
{
  "welcome": "Welcome!",
  "greeting": "Hello, ${name}!",
  "messages": {
    "success": "Operation successful!"
  }
}
```

**src/assets/i18n/vi.json:**
```json
{
  "welcome": "Chào mừng!",
  "greeting": "Xin chào, ${name}!",
  "messages": {
    "success": "Thao tác thành công!"
  }
}
```

## Sử dụng

### 1. Trong Template (với Pipe)

```html
<h1>{{ 'welcome' | translate }}</h1>
<p>{{ 'greeting' | translate: {name: 'John'} }}</p>
<p>{{ 'messages.success' | translate }}</p>

<!-- Language switcher -->
<button (click)="switchLanguage('en')">English</button>
<button (click)="switchLanguage('vi')">Tiếng Việt</button>
```

### 2. Trong Component (Programmatic)

```typescript
import { I18nService } from './lib/i18n.service';

export class MyComponent {
  constructor(private i18n: I18nService) {}

  ngOnInit() {
    // Load language
    this.i18n.setLanguage('vi').subscribe();

    // Get translation
    this.i18n.get('welcome').subscribe(text => {
      console.log(text); // "Chào mừng!"
    });

    // Get with variables
    this.i18n.get('greeting', { name: 'Angular' }).subscribe(text => {
      console.log(text); // "Xin chào, Angular!"
    });

    // Get instant (synchronous)
    const text = this.i18n.instant('welcome');
  }

  switchLanguage(lang: string) {
    this.i18n.setLanguage(lang).subscribe();
  }
}
```

### 3. Subscribe to language changes

```typescript
export class MyComponent implements OnInit {
  constructor(private i18n: I18nService) {}

  ngOnInit() {
    // Listen to language changes
    this.i18n.onLangChange$.subscribe(currentLang => {
      console.log('Language changed to:', currentLang);
    });
  }
}
```

## API Reference

### I18nService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `setLanguage(lang: string)` | Set current language and load if needed | `Observable<TranslationObject>` |
| `loadLanguage(lang: string)` | Load language file | `Observable<TranslationObject>` |
| `get(key: string, params?)` | Get translation (async) | `Observable<string>` |
| `instant(key: string, params?)` | Get translation (sync) | `string` |
| `getCurrentLanguage()` | Get current language | `string` |
| `getLoadedLanguages()` | Get loaded languages | `string[]` |

### TranslatePipe

```html
{{ 'key' | translate }}
{{ 'key' | translate: {param1: 'value1', param2: 'value2'} }}
```

### Configuration

```typescript
interface I18nConfig {
  defaultLanguage?: string;    // Default: 'en'
  fallbackLanguage?: string;   // Default: 'en'
  assetsPath?: string;         // Default: './assets/i18n'
}
```

## Tính năng

✅ **Template Pipe**: Sử dụng `{{ 'key' | translate }}` trong template  
✅ **Programmatic API**: `get()` và `instant()` methods  
✅ **Variable Interpolation**: `${variable}` syntax  
✅ **Nested Keys**: `messages.success` format  
✅ **Async Loading**: HTTP loader với caching  
✅ **Language Switching**: Real-time language switching  
✅ **Fallback Support**: Fallback to default language  
✅ **Type Safety**: Full TypeScript support  

## So sánh với ngx-translate

| Feature | ngx-translate | This Module |
|---------|---------------|-------------|
| Template Pipe | ✅ | ✅ |
| Programmatic API | ✅ | ✅ |
| HTTP Loader | ✅ | ✅ Built-in |
| Variable Interpolation | ✅ | ✅ |
| Language Switching | ✅ | ✅ |
| Multiple Loaders | ✅ | ❌ (Only HTTP) |
| Plugin System | ✅ | ❌ |
| Complex Configurations | ✅ | ❌ (Simplified) |
| Bundle Size | Larger | Smaller |
| Learning Curve | Steeper | Easier |

## Build và Deploy

```bash
# Build library
npm run build-lib

# Build example app
npm run build

# Serve example
npm run serve
```

Module này hoàn hảo cho các dự án Angular cần i18n đơn giản mà không muốn phức tạp hóa với ngx-translate.
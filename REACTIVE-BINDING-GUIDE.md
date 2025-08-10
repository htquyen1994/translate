# Reactive Binding với Tagged Templates

## ❓ Câu hỏi: Tagged Templates có binding với ngôn ngữ hiện tại không?

**Câu trả lời**: Có, nhưng có 2 cách khác nhau!

## 🔄 2 Types của Tagged Templates:

### 1. **Synchronous Tagged Templates** (Không tự động update)

```typescript
// Chỉ evaluate một lần khi được gọi
const message = this.i18n.template`Welcome to ${'app.title'}!`;
```

**Đặc điểm:**
- ✅ Lấy translation từ ngôn ngữ hiện tại
- ❌ KHÔNG tự động update khi đổi ngôn ngữ
- ⚡ Performance cao (không reactive)
- 🎯 Phù hợp cho static content

### 2. **Reactive Tagged Templates** (Tự động update)

```typescript
// Trả về Observable, tự động update khi đổi ngôn ngữ
const message$ = this.i18n.template$`Welcome to ${'app.title'}!`;
```

**Đặc điểm:**
- ✅ Lấy translation từ ngôn ngữ hiện tại
- ✅ Tự động update khi đổi ngôn ngữ
- 🔄 Reactive với RxJS Observable
- 🎯 Phù hợp cho dynamic content

## 💡 So sánh cách sử dụng:

### Synchronous Version:
```typescript
export class MyComponent implements OnInit {
  message = '';

  ngOnInit() {
    // Chỉ evaluate một lần
    this.message = this.i18n.template`Hello ${'app.title'}!`;
    
    // Cần manual refresh khi đổi ngôn ngữ
    this.i18n.onLangChange$.subscribe(() => {
      this.message = this.i18n.template`Hello ${'app.title'}!`; // Manual update
    });
  }
}
```

### Reactive Version:
```typescript
export class MyComponent implements OnInit {
  message$: Observable<string>;

  ngOnInit() {
    // Tự động update khi đổi ngôn ngữ
    this.message$ = this.i18n.template$`Hello ${'app.title'}!`;
  }
}
```

**Template:**
```html
<!-- Synchronous -->
<p>{{ message }}</p>

<!-- Reactive -->
<p>{{ message$ | async }}</p>
```

## 🔧 Implementation Details:

### Synchronous Tagged Template:
```typescript
template = (strings: TemplateStringsArray, ...values: any[]): string => {
  // Lấy translations tại thời điểm gọi
  const translations = this.translations.get(this.currentLang$.value) || {};
  
  // Process và return string
  // ...
};
```

### Reactive Tagged Template:
```typescript
template$ = (strings: TemplateStringsArray, ...values: any[]): Observable<string> => {
  // Subscribe to language changes
  return this.currentLang$.pipe(
    map(() => {
      // Re-evaluate mỗi khi ngôn ngữ thay đổi
      const translations = this.translations.get(this.currentLang$.value) || {};
      // Process và return string
      // ...
    })
  );
};
```

## 🎯 Khi nào dùng cái nào?

### Dùng **Synchronous** (`template`) khi:
- Content không thay đổi thường xuyên
- Cần performance cao
- Chỉ evaluate một lần khi component khởi tạo
- Có thể manual refresh khi cần

### Dùng **Reactive** (`template$`) khi:
- Cần tự động update khi đổi ngôn ngữ
- Content hiển thị liên tục
- User có thể đổi ngôn ngữ trong runtime
- Muốn binding tự động

## 🚀 Advanced Usage:

### Context-aware Reactive Templates:
```typescript
ngOnInit() {
  const context = { user: 'John', count: 5 };
  
  // Reactive với context
  this.advancedMessage$ = this.i18n.tt$(context)`
    ${'welcome.message'} ${() => context.user} has ${() => context.count} items
  `;
}

// Template
<p>{{ advancedMessage$ | async }}</p>
```

### Conditional Reactive Templates:
```typescript
this.conditionalMessage$ = this.i18n.template$`
  Status: ${this.isLoggedIn ? 'auth.logged_in' : 'auth.logged_out'}
`;
```

## ⚡ Performance Comparison:

| Method | Performance | Auto-update | Memory Usage |
|--------|------------|-------------|--------------|
| `template` | ⚡⚡⚡ | ❌ | Thấp |
| `template$` | ⚡⚡ | ✅ | Trung bình |
| `get()` | ⚡⚡ | ❌ | Trung bình |
| `pipe` | ⚡ | ✅ | Thấp |

## 🎉 Kết luận:

**Có**, tagged templates hoàn toàn binding với ngôn ngữ hiện tại trong file JSON:

- **`template`**: Binding tại thời điểm gọi (static)
- **`template$`**: Reactive binding tự động update (dynamic)

Chọn version phù hợp với use case của bạn! 🚀
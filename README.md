# I18n Module - Hỗ trợ đa ngôn ngữ

Module JavaScript/TypeScript hỗ trợ đa ngôn ngữ (internationalization) với khả năng load file JSON, template strings và caching.

## Tính năng

- ✅ Load file JSON ngôn ngữ với cấu trúc key-value
- ✅ Template strings với cú pháp `${variable}`
- ✅ API đầy đủ: `setLanguage()`, `t()`, `loadLanguage()`
- ✅ Hoạt động trên cả Node.js và trình duyệt
- ✅ Hỗ trợ async khi load file JSON
- ✅ Cache ngôn ngữ để tránh load lại nhiều lần
- ✅ Viết bằng TypeScript với type safety

## Cài đặt và Sử dụng

### 1. Cấu trúc thư mục

```
project/
├── i18n.ts              # Module chính
├── locales/             # Thư mục chứa file ngôn ngữ
│   ├── en.json          # Tiếng Anh
│   ├── vi.json          # Tiếng Việt
│   └── ...
├── example.ts           # Ví dụ Node.js
└── example-browser.html # Ví dụ trình duyệt
```

### 2. File JSON ngôn ngữ

**locales/en.json:**
```json
{
  "welcome": "Welcome to our application!",
  "greeting": "Hello, ${name}!",
  "user_count": "We have ${count} users online"
}
```

**locales/vi.json:**
```json
{
  "welcome": "Chào mừng đến với ứng dụng của chúng tôi!",
  "greeting": "Xin chào, ${name}!",
  "user_count": "Chúng tôi có ${count} người dùng đang trực tuyến"
}
```

### 3. Sử dụng trong Node.js

```typescript
import I18n from './i18n';

const i18n = new I18n();

async function example() {
  // Load ngôn ngữ
  await i18n.loadLanguage('en');
  i18n.setLanguage('en');
  
  // Sử dụng translation
  console.log(i18n.t('welcome'));
  console.log(i18n.t('greeting', { name: 'John' }));
  console.log(i18n.t('user_count', { count: 42 }));
}
```

### 4. Sử dụng trong trình duyệt

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import I18n from './i18n.js';
        
        const i18n = new I18n();
        
        async function init() {
            await i18n.loadLanguage('vi');
            i18n.setLanguage('vi');
            
            document.body.innerHTML = i18n.t('welcome');
        }
        
        init();
    </script>
</head>
<body></body>
</html>
```

## API Reference

### `loadLanguage(langCode: string): Promise<void>`
Load file JSON ngôn ngữ tương ứng. File sẽ được cache để không load lại.

```typescript
await i18n.loadLanguage('en');
await i18n.loadLanguage('vi');
```

### `setLanguage(langCode: string): void`
Đặt ngôn ngữ hiện tại.

```typescript
i18n.setLanguage('en');
i18n.setLanguage('vi');
```

### `t(key: string, variables?: object): string`
Lấy chuỗi đã dịch kèm biến thay thế.

```typescript
// Chuỗi đơn giản
i18n.t('welcome');

// Với biến
i18n.t('greeting', { name: 'Alice' });
i18n.t('user_count', { count: 100 });
```

### Các phương thức bổ sung

```typescript
// Lấy ngôn ngữ hiện tại
i18n.getCurrentLanguage();

// Lấy danh sách ngôn ngữ đã load
i18n.getLoadedLanguages();

// Xóa cache
i18n.clearCache();
```

## Template Strings

Sử dụng cú pháp `${variable}` trong file JSON:

```json
{
  "greeting": "Hello, ${name}!",
  "message": "You have ${count} new messages",
  "error": "Error ${code}: ${message}"
}
```

Truyền biến khi gọi `t()`:

```typescript
i18n.t('greeting', { name: 'John' });
i18n.t('message', { count: 5 });
i18n.t('error', { code: 404, message: 'Not found' });
```

## Chạy ví dụ

### Node.js
```bash
# Cần TypeScript
npm install -g typescript ts-node

# Chạy ví dụ
ts-node example.ts
```

### Trình duyệt
```bash
# Khởi động web server
python -m http.server 8000
# hoặc
npx serve .

# Mở http://localhost:8000/example-browser.html
```

## Xử lý lỗi

- Nếu file ngôn ngữ không tồn tại → throw error
- Nếu key không tồn tại → return key gốc + warning
- Nếu ngôn ngữ chưa load → return key gốc + warning
- Nếu biến không tồn tại → giữ nguyên `${variable}` trong chuỗi

## Tính năng nâng cao

- **Cache thông minh**: Chỉ load file một lần
- **Type safety**: Đầy đủ TypeScript types
- **Universal**: Hoạt động trên Node.js và browser
- **Error handling**: Xử lý lỗi graceful
- **Performance**: Tối ưu cho hiệu suất
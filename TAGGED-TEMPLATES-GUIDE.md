# Tagged Templates Implementation Guide

## 🏷️ Tagged Templates cho Angular i18n

Tagged Templates là tính năng mạnh mẽ của ES6 Template Literals, cho phép bạn xử lý template strings một cách elegant và type-safe.

## ✨ Tính năng mới:

### 1. **Basic Tagged Template** (`template`)

```typescript
// Sử dụng trực tiếp
const message = this.i18n.template`Welcome to ${'app.title'}!`;

// Với dynamic values
const greeting = this.i18n.template`Hello ${username}, today is ${new Date().toLocaleDateString()}`;
```

**Đặc điểm:**
- Tự động translate keys (có dấu `.`)
- Giữ nguyên literals khác
- Type-safe và performant

### 2. **Advanced Tagged Template** (`tt`)

```typescript
// Với context
const context = { name: 'John', age: 25, items: 5 };

const message = this.i18n.tt(context)`
  ${'auth.welcome_user'} You have ${() => context.items} items.
  Age check: ${() => context.age >= 18 ? 'Adult' : 'Minor'}
`;
```

**Tính năng:**
- Context-aware interpolation
- Function execution với context
- Nested translation keys
- Complex expressions

## 🚀 Cách hoạt động:

### Tagged Template Function Signature:
```typescript
function taggedTemplate(strings: TemplateStringsArray, ...values: any[]): string
```

### Internal Implementation:
1. **Parse**: Tách strings và values
2. **Process**: Xử lý translation keys và functions  
3. **Interpolate**: Apply context variables
4. **Return**: Combined result string

## 📝 So sánh các approaches:

### Traditional Method:
```typescript
// Cũ
this.i18n.get('greeting', { name: 'John' }).subscribe(text => {
  console.log(text);
});

// Pipe
{{ 'greeting' | translate: {name: 'John'} }}
```

### Tagged Templates:
```typescript
// Mới - Clean và elegant
const message = this.i18n.template`${'greeting'} ${username}!`;

// Advanced với logic
const advanced = this.i18n.tt({ name: 'John', age: 25 })`
  ${'greeting'} ${() => age >= 18 ? 'Welcome adult!' : 'Hey kid!'}
`;
```

## 🔥 Advanced Use Cases:

### 1. **Conditional Translation**
```typescript
const message = this.i18n.tt({ isLoggedIn: true, username: 'John' })`
  ${() => isLoggedIn ? 'auth.welcome_user' : 'auth.login_prompt'}
`;
```

### 2. **Dynamic Key Selection**
```typescript
const level = 'error'; // or 'success', 'warning'
const notification = this.i18n.template`Status: ${'messages.' + level + '_message'}`;
```

### 3. **Nested Translations**
```typescript
const complex = this.i18n.tt({ count: 5 })`
  ${'app.title'}: ${'messages.items_count'} in ${'navigation.settings'}
`;
```

### 4. **Real-time Updates**
```typescript
const liveMessage = this.i18n.template`
  Current time: ${new Date().toLocaleTimeString()}
  Status: ${'app.status'}
  Users online: ${this.onlineUsers.length}
`;
```

### 5. **Multi-language Expressions**
```typescript
const context = { amount: 1250, currency: 'USD' };

const price = this.i18n.tt(context)`
  ${'common.price'}: ${() => 
    currentLang === 'vi' 
      ? amount.toLocaleString('vi-VN') + '₫'
      : '$' + amount.toFixed(2)
  }
`;
```

## ⚡ Performance Benefits:

1. **No RegEx**: Không cần regex parsing
2. **Native JS**: Sử dụng ES6 template literals
3. **Type Safe**: Full TypeScript support
4. **Cached**: Template functions được reuse

## 🔧 Implementation Details:

### Basic Template Tag:
```typescript
template = (strings: TemplateStringsArray, ...values: any[]): string => {
  const translations = this.translations.get(this.currentLang$.value) || {};
  
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    let value = values[i];
    
    // Auto-translate keys containing dots
    if (typeof value === 'string' && value.includes('.')) {
      const translated = this.getTranslation(translations, value);
      if (translated) value = translated;
    }
    
    result += String(value) + (strings[i + 1] || '');
  }
  
  return result;
};
```

### Advanced Template Tag:
```typescript
tt = (context?: { [key: string]: any }) => {
  return (strings: TemplateStringsArray, ...values: any[]): string => {
    // Process với context và function execution
    // ... implementation
  };
};
```

## 📊 Comparison Table:

| Feature | Pipe | get() | instant() | Tagged Template |
|---------|------|-------|-----------|----------------|
| Template syntax | ❌ | ❌ | ❌ | ✅ |
| Type safety | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Performance | ⚠️ | ⚠️ | ✅ | ✅ |
| Real-time expressions | ❌ | ❌ | ❌ | ✅ |
| Function execution | ❌ | ❌ | ❌ | ✅ |
| Auto key detection | ❌ | ❌ | ❌ | ✅ |
| Readability | ⚠️ | ⚠️ | ⚠️ | ✅ |

## 🎯 Best Practices:

1. **Use for complex messages**: Thay thế multiple get() calls
2. **Leverage functions**: Cho logic động
3. **Context sharing**: Reuse context objects
4. **Key naming**: Clear translation key structure
5. **Performance**: Cache template functions

## 🔮 Future Potential:

- **IDE Extensions**: Syntax highlighting cho translation keys
- **Type Generation**: Auto-generate types từ JSON
- **Hot Reload**: Real-time translation updates
- **Debugging Tools**: Tagged template debugging

Tagged Templates biến i18n thành một template language mạnh mẽ và elegant! 🚀
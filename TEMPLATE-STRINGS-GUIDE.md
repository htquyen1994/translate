# Template Strings Implementation Guide

## 🚀 Đã implement Template Strings cho Angular i18n module!

Template strings cho phép sử dụng toàn bộ sức mạnh của JavaScript template literals trong translation strings.

## ✨ Tính năng mới:

### 1. **Conditional Logic**
```json
{
  "conditional_message": "Hello ${name}${age ? ', you are ' + age + ' years old' : ''}!"
}
```

```typescript
// Sử dụng
{{ 'conditional_message' | translate: {name: 'John', age: 25} }}
// Output: "Hello John, you are 25 years old!"

{{ 'conditional_message' | translate: {name: 'Jane'} }}
// Output: "Hello Jane!"
```

### 2. **Mathematical Calculations**
```json
{
  "calculation": "Total price: $${(price * quantity).toFixed(2)}"
}
```

```typescript
{{ 'calculation' | translate: {price: 25.5, quantity: 3} }}
// Output: "Total price: $76.50"
```

### 3. **String Methods & Optional Chaining**
```json
{
  "uppercase_name": "Welcome ${name?.toUpperCase() || 'Guest'}!"
}
```

```typescript
{{ 'uppercase_name' | translate: {name: 'john'} }}
// Output: "Welcome JOHN!"

{{ 'uppercase_name' | translate: {} }}
// Output: "Welcome Guest!"
```

### 4. **Built-in JavaScript Functions**
```json
{
  "formatted_date": "Today is ${new Date().toLocaleDateString()}"
}
```

```typescript
{{ 'formatted_date' | translate: {} }}
// Output: "Today is 1/10/2025"
```

### 5. **Locale-specific Formatting**
```json
{
  "vi_calculation": "Tổng tiền: ${(price * quantity).toLocaleString('vi-VN')}₫"
}
```

## 🔧 Cách hoạt động:

1. **Conversion**: Chuyển đổi placeholders thành template literal syntax
   - `${variable}` → `${params.variable ?? '${variable}'}`
   - `{{variable}}` → `${params.variable ?? '{{variable}}'}`
   - `{{0}}` → `${params[0]}`

2. **Evaluation**: Sử dụng `Function` constructor để safely evaluate template
3. **Fallback**: Nếu có lỗi, trả về text gốc

## ⚡ Ưu điểm:

- **Powerful**: Có thể sử dụng toàn bộ JavaScript expressions
- **Flexible**: Conditional logic, calculations, formatting
- **Safe**: Sử dụng Function constructor thay vì eval()
- **Compatible**: Vẫn hỗ trợ format cũ
- **Performant**: Template được cache và reuse

## ⚠️ Lưu ý bảo mật:

- Sử dụng `Function` constructor thay vì `eval()` để tăng bảo mật
- Parameters được validate trước khi evaluate
- Fallback mechanism khi có lỗi
- Không cho phép access global scope trực tiếp

## 📝 Ví dụ phức tạp:

### Shopping Cart
```json
{
  "cart_summary": "Cart: ${items.length} items, Total: $${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}"
}
```

### User Status
```json
{
  "user_status": "${user.isOnline ? '🟢 ' + user.name + ' is online' : '🔴 ' + user.name + ' is offline'}"
}
```

### Date Formatting
```json
{
  "relative_date": "${Math.floor((Date.now() - timestamp) / 86400000)} days ago"
}
```

## 🔄 Migration từ regex-based:

**Trước:**
```typescript
private interpolate(text: string, params: any) {
  return text.replace(/\${(\w+)}/g, (match, key) => params[key] || match);
}
```

**Sau:**
```typescript
private interpolate(text: string, params: any) {
  const templateFunc = new Function('params', `return \`${processedText}\`;`);
  return templateFunc(params);
}
```

## 🎯 Use Cases hay:

1. **E-commerce**: Price calculations, discounts
2. **Social**: Relative time, user status
3. **Forms**: Validation messages with context
4. **Analytics**: Dynamic reports với calculations
5. **Multilingual**: Locale-specific formatting

Template strings biến translation module thành một template engine mini mạnh mẽ! 🚀
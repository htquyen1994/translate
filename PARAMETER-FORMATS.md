# Parameter Formats Guide

The Angular i18n module now supports multiple parameter formats to be compatible with different internationalization standards.

## Supported Formats

### 1. Named Parameters with `${variable}` (Original format)

**JSON:**
```json
{
  "greeting": "Hello, ${name}!",
  "message": "You have ${count} items in ${location}"
}
```

**Usage:**
```typescript
// Template
{{ 'greeting' | translate: {name: 'John'} }}
{{ 'message' | translate: {count: 5, location: 'cart'} }}

// Component
this.i18n.get('greeting', { name: 'John' }).subscribe(text => console.log(text));
this.i18n.instant('message', { count: 5, location: 'cart' });
```

**Output:**
- `"Hello, John!"`
- `"You have 5 items in cart"`

### 2. Indexed Parameters with `{{index}}` (ngx-translate compatible)

**JSON:**
```json
{
  "greeting": "Hello {{0}}!",
  "message": "{{0}} sent you {{1}} on {{2}}"
}
```

**Usage:**
```typescript
// Template
{{ 'greeting' | translate: ['John'] }}
{{ 'message' | translate: ['Alice', 'a document', 'Monday'] }}

// Component
this.i18n.get('greeting', ['John']).subscribe(text => console.log(text));
this.i18n.instant('message', ['Alice', 'a document', 'Monday']);
```

**Output:**
- `"Hello John!"`
- `"Alice sent you a document on Monday"`

### 3. Named Parameters with `{{variable}}` (Alternative format)

**JSON:**
```json
{
  "greeting": "Hello, {{name}}!",
  "message": "You have {{count}} items"
}
```

**Usage:**
```typescript
// Template
{{ 'greeting' | translate: {name: 'John'} }}
{{ 'message' | translate: {count: 5} }}

// Component
this.i18n.get('greeting', { name: 'John' }).subscribe(text => console.log(text));
```

**Output:**
- `"Hello, John!"`
- `"You have 5 items"`

### 4. Mixed Format (Advanced)

You can even mix different formats in the same translation:

**JSON:**
```json
{
  "mixed": "Welcome ${name}! You are user {{0}} in our system"
}
```

**Usage:**
```typescript
// Pass both named and indexed parameters
{{ 'mixed' | translate: {name: 'Bob', '0': '42'} }}
```

**Output:**
- `"Welcome Bob! You are user 42 in our system"`

## Migration from ngx-translate

If you're migrating from ngx-translate, your existing JSON files with `{{0}}`, `{{1}}`, etc. will work directly:

**Before (ngx-translate):**
```json
{
  "HELLO_WORLD": "Hello {{0}}!"
}
```

**After (this module):**
```json
{
  "HELLO_WORLD": "Hello {{0}}!"
}
```

**Usage remains the same:**
```typescript
{{ 'HELLO_WORLD' | translate: ['World'] }}
```

## Best Practices

1. **For simple messages**: Use named parameters `${variable}` for clarity
   ```json
   {"welcome": "Welcome, ${name}!"}
   ```

2. **For ordered parameters**: Use indexed parameters `{{0}}, {{1}}`
   ```json  
   {"template": "{{0}} sent {{1}} to {{2}}"}
   ```

3. **For consistency**: Choose one format per project and stick to it

4. **For migration**: Keep existing `{{index}}` format when migrating from ngx-translate

## Error Handling

- If a parameter is missing, the placeholder remains unchanged
- Example: `"Hello ${name}!"` with `{}` → `"Hello ${name}!"`
- Example: `"Hello {{0}}!"` with `[]` → `"Hello {{0}}!"`

## Performance

Both parameter formats have similar performance. The module automatically detects whether you're passing an array or object and uses the appropriate interpolation strategy.
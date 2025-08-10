import I18n from './i18n';

// Khởi tạo i18n instance
const i18n = new I18n();

// Hàm demo sử dụng i18n
async function demonstrateI18n() {
  try {
    console.log('=== I18n Module Demo ===\n');

    // Load ngôn ngữ tiếng Anh
    console.log('Loading English language...');
    await i18n.loadLanguage('en');
    i18n.setLanguage('en');
    
    console.log('Current language:', i18n.getCurrentLanguage());
    console.log('Welcome message:', i18n.t('welcome'));
    console.log('Greeting with name:', i18n.t('greeting', { name: 'John' }));
    console.log('User count:', i18n.t('user_count', { count: 42 }));
    console.log('Error message:', i18n.t('error_message', { error: 'Network timeout' }));
    console.log('');

    // Chuyển sang tiếng Việt
    console.log('Loading Vietnamese language...');
    await i18n.loadLanguage('vi');
    i18n.setLanguage('vi');
    
    console.log('Current language:', i18n.getCurrentLanguage());
    console.log('Welcome message:', i18n.t('welcome'));
    console.log('Greeting with name:', i18n.t('greeting', { name: 'Nguyễn Văn A' }));
    console.log('User count:', i18n.t('user_count', { count: 123 }));
    console.log('Confirm delete:', i18n.t('confirm_delete', { item: 'tài liệu này' }));
    console.log('');

    // Kiểm tra cache
    console.log('Loaded languages:', i18n.getLoadedLanguages());
    
    // Test key không tồn tại
    console.log('Non-existent key:', i18n.t('non_existent_key'));
    
    // Test ngôn ngữ chưa load
    i18n.setLanguage('fr');
    console.log('Unloaded language test:', i18n.t('welcome'));

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Chạy demo
demonstrateI18n();
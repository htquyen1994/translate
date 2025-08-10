import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { I18nService } from '../i18n.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>{{ 'app.title' | translate }}</h1>
      
      <div class="language-switcher">
        <h3>Language / Ngôn ngữ:</h3>
        <button 
          (click)="switchLanguage('en')"
          [class.active]="currentLanguage === 'en'">
          English
        </button>
        <button 
          (click)="switchLanguage('vi')"
          [class.active]="currentLanguage === 'vi'">
          Tiếng Việt
        </button>
      </div>

      <div class="demo-section">
        <h2>Basic Translations</h2>
        <p>{{ 'app.welcome' | translate }}</p>
        <p>{{ 'app.loading' | translate }}</p>
      </div>

      <div class="demo-section">
        <h2>Navigation</h2>
        <nav>
          <a href="#">{{ 'navigation.home' | translate }}</a>
          <a href="#">{{ 'navigation.about' | translate }}</a>
          <a href="#">{{ 'navigation.contact' | translate }}</a>
          <a href="#">{{ 'navigation.settings' | translate }}</a>
        </nav>
      </div>

      <div class="demo-section">
        <h2>Authentication</h2>
        <div class="auth-form">
          <label>{{ 'auth.username' | translate }}:</label>
          <input type="text" [(ngModel)]="username">
          
          <label>{{ 'auth.password' | translate }}:</label>
          <input type="password">
          
          <button>{{ 'auth.login' | translate }}</button>
        </div>
        
        <p *ngIf="username">
          {{ 'auth.welcome_user' | translate: {name: username} }}
        </p>
      </div>

      <div class="demo-section">
        <h2>Template with Variables</h2>
        <h3>Object Parameters (${key} format):</h3>
        <p>{{ 'messages.items_count' | translate: {count: itemCount} }}</p>
        <p>{{ 'messages.error_occurred' | translate: {error: 'Connection timeout'} }}</p>
        
        <h3>Array Parameters ({{0}} format):</h3>
        <p>{{ 'messages.indexed_message' | translate: ['John', 5] }}</p>
        <p>{{ 'messages.template_message' | translate: ['Alice', 'a document', 'Monday'] }}</p>
        
        <h3>Advanced Template Strings:</h3>
        <p>{{ 'messages.conditional_message' | translate: {name: username || 'Anonymous', age: userAge} }}</p>
        <p>{{ 'messages.calculation' | translate: {price: 25.5, quantity: 3} }}</p>
        <p>{{ 'messages.uppercase_name' | translate: {name: username} }}</p>
        <p>{{ 'messages.formatted_date' | translate: {} }}</p>
        
        <h3>Mixed Format:</h3>
        <p>{{ 'messages.mixed_format' | translate: {name: 'Bob', '0': '42'} }}</p>
        
        <div class="controls">
          <label>Username: <input [(ngModel)]="username" placeholder="Enter name"></label>
          <label>Age: <input type="number" [(ngModel)]="userAge" placeholder="Age"></label>
          <button (click)="itemCount = itemCount + 1">Add Item</button>
          <button (click)="itemCount = Math.max(0, itemCount - 1)">Remove Item</button>
        </div>
      </div>

      <div class="demo-section">
        <h2>Programmatic Usage</h2>
        <h3>Traditional Methods:</h3>
        <p>{{ welcomeMessage }}</p>
        <p>{{ errorMessage }}</p>
        <p>{{ arrayMessage }}</p>
        <p>{{ templateMessage }}</p>
        
        <h3>Tagged Templates (New!):</h3>
        <div class="tagged-section">
          <h4>Synchronous (manual refresh needed):</h4>
          <p>{{ taggedTemplateMessage }}</p>
          <p>{{ advancedTaggedMessage }}</p>
          <p>{{ dynamicTaggedMessage }}</p>
          <button (click)="updateTaggedTemplates()">Refresh Tagged Templates</button>
        </div>

        <div class="tagged-section">
          <h4>Reactive (auto-updates with language change):</h4>
          <p>{{ reactiveTemplateMessage$ | async }}</p>
          <p>{{ reactiveAdvancedMessage$ | async }}</p>
        </div>
      </div>

      <div class="demo-section">
        <h2>Common Buttons</h2>
        <div class="button-group">
          <button class="btn-primary">{{ 'common.save' | translate }}</button>
          <button class="btn-secondary">{{ 'common.cancel' | translate }}</button>
          <button class="btn-danger">{{ 'common.delete' | translate }}</button>
          <button class="btn-info">{{ 'common.edit' | translate }}</button>
        </div>
      </div>

      <div class="demo-section">
        <h2>Interpolation Method Comparison</h2>
        <div class="method-switcher">
          <h3>Current Method: {{ currentInterpolationMethod }}</h3>
          <button 
            (click)="setInterpolationMethod('regex')"
            [class.active]="currentInterpolationMethod === 'regex'">
            Regex Method
          </button>
          <button 
            (click)="setInterpolationMethod('template-strings')"
            [class.active]="currentInterpolationMethod === 'template-strings'">
            Template Strings
          </button>
          <button 
            (click)="setInterpolationMethod('auto')"
            [class.active]="currentInterpolationMethod === 'auto'">
            Auto (Template + Fallback)
          </button>
        </div>

        <div class="test-results" *ngIf="testResults">
          <h4>Test Results for: "{{ testText }}"</h4>
          <div class="result-item">
            <strong>Template Strings:</strong> {{ testResults.templateStrings }}
          </div>
          <div class="result-item">
            <strong>Regex Method:</strong> {{ testResults.regex }}
          </div>
          <div class="result-item current">
            <strong>Current Method:</strong> {{ testResults.current }}
          </div>
        </div>

        <button (click)="runInterpolationTest()">Test Interpolation Methods</button>
      </div>

      <div class="info">
        <p><strong>Current Language:</strong> {{ currentLanguage }}</p>
        <p><strong>Loaded Languages:</strong> {{ loadedLanguages.join(', ') }}</p>
        <p><strong>Interpolation Method:</strong> {{ currentInterpolationMethod }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .language-switcher {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .language-switcher button {
      margin: 5px;
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .language-switcher button.active,
    .method-switcher button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .method-switcher {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .method-switcher button {
      margin: 5px;
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .test-results {
      margin: 20px 0;
      padding: 15px;
      background: #e9ecef;
      border-radius: 8px;
      font-family: monospace;
    }

    .result-item {
      margin: 5px 0;
      padding: 5px;
    }

    .result-item.current {
      background: #d4edda;
      font-weight: bold;
    }

    .tagged-section {
      margin: 15px 0;
      padding: 15px;
      border-left: 4px solid #007bff;
      background: #f8f9fa;
    }

    .tagged-section h4 {
      margin-top: 0;
      color: #495057;
    }

    .demo-section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }

    .demo-section h2 {
      margin-top: 0;
      color: #333;
    }

    nav a {
      margin-right: 15px;
      color: #007bff;
      text-decoration: none;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      max-width: 300px;
    }

    .auth-form label {
      margin-top: 10px;
      font-weight: bold;
    }

    .auth-form input {
      padding: 8px;
      margin: 5px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .button-group button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-info { background: #17a2b8; color: white; }

    .controls {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: end;
      margin-top: 15px;
    }

    .controls label {
      display: flex;
      flex-direction: column;
      font-weight: bold;
    }

    .controls input {
      padding: 5px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 2px;
      min-width: 120px;
    }

    .info {
      margin-top: 30px;
      padding: 15px;
      background: #e9ecef;
      border-radius: 8px;
    }
  `]
})
export class AppComponent implements OnInit {
  currentLanguage = 'en';
  loadedLanguages: string[] = [];
  username = '';
  userAge?: number;
  itemCount = 5;
  welcomeMessage = '';
  errorMessage = '';
  arrayMessage = '';
  templateMessage = '';
  currentInterpolationMethod = 'auto';
  testResults: any = null;
  testText = '';
  taggedTemplateMessage = '';
  advancedTaggedMessage = '';
  dynamicTaggedMessage = '';
  reactiveTemplateMessage$: Observable<string> | undefined;
  reactiveAdvancedMessage$: Observable<string> | undefined;

  constructor(private i18nService: I18nService) {}

  async ngOnInit() {
    // Load initial language
    this.i18nService.setLanguage('en').subscribe();
    
    // Subscribe to language changes
    this.i18nService.onLangChange$.subscribe(lang => {
      this.currentLanguage = lang;
      this.loadedLanguages = this.i18nService.getLoadedLanguages();
      this.updateProgrammaticMessages();
    });

    this.currentInterpolationMethod = this.i18nService.getInterpolationMethod();
    this.updateProgrammaticMessages();
    this.updateTaggedTemplates();
    this.setupReactiveTaggedTemplates();
  }

  switchLanguage(lang: string) {
    this.i18nService.setLanguage(lang).subscribe(() => {
      console.log(`Language switched to: ${lang}`);
    });
  }

  private updateProgrammaticMessages() {
    // Object parameters examples
    this.i18nService.get('auth.welcome_user', { name: 'Angular User' })
      .subscribe(message => this.welcomeMessage = message);
    
    this.i18nService.get('messages.error_occurred', { error: 'Service unavailable' })
      .subscribe(message => this.errorMessage = message);

    // Array parameters examples  
    this.i18nService.get('messages.indexed_message', ['Developer', 3])
      .subscribe(message => this.arrayMessage = message);
      
    this.i18nService.get('messages.template_message', ['System', 'a notification', 'today'])
      .subscribe(message => this.templateMessage = message);
  }

  setInterpolationMethod(method: 'template-strings' | 'regex' | 'auto') {
    this.i18nService.setInterpolationMethod(method);
    this.currentInterpolationMethod = method;
    this.updateProgrammaticMessages();
    this.updateTaggedTemplates();
  }

  runInterpolationTest() {
    const testCases = [
      { text: 'Hello ${name}!', params: { name: 'World' } },
      { text: 'Price: $${(price * 1.1).toFixed(2)}', params: { price: 25.5 } },
      { text: 'Welcome {{0}}!', params: ['User'] },
      { text: 'Today is ${new Date().toLocaleDateString()}', params: {} }
    ];

    const randomCase = testCases[Math.floor(Math.random() * testCases.length)];
    this.testText = randomCase.text;
    this.testResults = this.i18nService.testInterpolation(randomCase.text, randomCase.params);
  }

  updateTaggedTemplates() {
    // Basic tagged template usage
    this.taggedTemplateMessage = this.i18nService.template`Welcome to ${'app.title'} - Current time: ${new Date().toLocaleTimeString()}`;
    
    // Advanced tagged template with context
    const context = { 
      name: this.username || 'User', 
      count: this.itemCount,
      currentLang: this.currentLanguage
    };
    
    this.advancedTaggedMessage = this.i18nService.tt(context)`
      ${'auth.greeting'} In ${'navigation.settings'}, you have ${() => context.count} items. 
      Language: ${() => context.currentLang.toUpperCase()}
    `;
    
    // Dynamic tagged template
    const dynamicKey = this.currentLanguage === 'vi' ? 'messages.success_saved' : 'messages.error_occurred';
    this.dynamicTaggedMessage = this.i18nService.template`Status: ${dynamicKey}`;
  }

  setupReactiveTaggedTemplates() {
    // Reactive tagged templates - auto-update when language changes
    this.reactiveTemplateMessage$ = this.i18nService.template$`
      🚀 Reactive: ${'app.title'} - Time: ${new Date().toLocaleTimeString()}
    `;
    
    // Reactive advanced template with context
    const context = { 
      user: this.username || 'Anonymous',
      count: this.itemCount 
    };
    
    this.reactiveAdvancedMessage$ = this.i18nService.tt$(context)`
      🔥 Advanced Reactive: ${'auth.greeting'} You have ${() => context.count} items in ${'navigation.settings'}
    `;
  }
}
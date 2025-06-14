import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Translation {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('uk');
  private translations: { [key: string]: Translation } = {};

  constructor(private http: HttpClient) {
    this.loadTranslation('uk').subscribe();

    // Відновлюємо збережену мову
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.setLanguage(savedLang);
    }
  }

  private loadTranslation(lang: string): Observable<Translation> {
    if (this.translations[lang]) {
      return new BehaviorSubject(this.translations[lang]).asObservable();
    }

    return this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
      map(translations => {
        this.translations[lang] = translations;
        return translations;
      })
    );
  }

  setLanguage(lang: string): void {
    this.loadTranslation(lang).subscribe(() => {
      this.currentLang.next(lang);
      localStorage.setItem('selectedLanguage', lang);
    });
  }

  getCurrentLanguage(): Observable<string> {
    return this.currentLang.asObservable();
  }

  get(key: string): Observable<string> {
    return this.currentLang.pipe(
      map(lang => {
        const translation = this.translations[lang];
        return this.getNestedTranslation(translation, key) || key;
      })
    );
  }

  instant(key: string): string {
    const lang = this.currentLang.value;
    const translation = this.translations[lang];
    return this.getNestedTranslation(translation, key) || key;
  }

  private getNestedTranslation(obj: any, key: string): string {
    return key.split('.').reduce((o, k) => o && o[k], obj);
  }

  getAvailableLanguages(): { code: string, name: string }[] {
    return [
      { code: 'uk', name: 'Українська' },
      { code: 'en', name: 'English' }
    ];
  }
}

import {Component, OnInit} from '@angular/core';
import {TranslationService} from '../../services/translation.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  imports: [
    NgForOf
  ],
  templateUrl: './language-switcher.component.html',
  standalone: true,
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage = 'uk';
  availableLanguages: { code: string; name: string }[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.availableLanguages = this.translationService.getAvailableLanguages();
    this.translationService.getCurrentLanguage().subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  onLanguageChange(event: any): void {
    const selectedLanguage = event.target.value;
    this.translationService.setLanguage(selectedLanguage);
  }
}

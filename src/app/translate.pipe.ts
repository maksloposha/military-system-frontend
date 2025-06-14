import { Pipe, PipeTransform } from '@angular/core';
import {TranslationService} from './services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private translated = '';

  constructor(private translationService: TranslationService) {}

  transform(key: string): string {
    this.translated = this.translationService.instant(key);
    return this.translated;
  }
}

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes'; // цей файл містить ваші маршрути
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // підключення маршрутів
    provideHttpClient(),    // підключення HttpClient
    provideAnimations(),    // підключення анімацій
  ]
});

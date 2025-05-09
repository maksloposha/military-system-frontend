import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './auth/auth.interceptor';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`, // тут буде відображатися компонент в залежності від маршруту
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet], // необхідно імпортувати RouterOutlet для роботи маршрутизації
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppComponent {
  title = 'military-system-frontend';
}

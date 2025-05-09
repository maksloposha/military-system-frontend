import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl =  `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/status`, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getCurrentUserRole(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/role`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error fetching models role:', error);
        return of(null);
      })
    );
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}

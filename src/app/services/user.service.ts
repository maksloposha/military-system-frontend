import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {withCredentials: true});
  }

  approveUser(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/approve`, {}, {withCredentials: true});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, {withCredentials: true});
  }

  loadCommanders(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/api/commanders`, { withCredentials: true });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/profile`, { withCredentials: true });
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/profile/update`, user, { withCredentials: true });
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`, {withCredentials: true});
  }

  updateUser(userId: number, user: User): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, user, {withCredentials: true});
  }

}

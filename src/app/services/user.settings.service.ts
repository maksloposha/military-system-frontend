import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private readonly baseUrl = `${environment.apiUrl}/api/user/settings`;

  constructor(private http: HttpClient) {}

  // Get all ranks
  getRanks(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/get/ranks`, { withCredentials: true });
  }

  // Get all unit types
  getUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/get/unit-types`, { withCredentials: true });
  }

  // Create a new rank
  addRank(rank: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/ranks`, rank, { withCredentials: true });
  }

  // Create a new unit type
  addUnit(unitType: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/unit-types`, unitType, { withCredentials: true });
  }

  // Delete a rank by ID
  deleteRank(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/ranks/${id}`, { withCredentials: true });
  }

  // Delete a unit type by ID
  deleteUnitType(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/unit-types/${id}`,  { withCredentials: true });
  }
}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {UnitType} from '../models/unitType.model';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private readonly baseUrl = `${environment.apiUrl}/api/user/settings`;

  constructor(private http: HttpClient) {
  }


  getRanks(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/get/ranks`, {withCredentials: true});
  }


  getUnits(): Observable<UnitType[]> {
    return this.http.get<UnitType[]>(`${this.baseUrl}/get/unit-types`, {withCredentials: true});
  }


  addRank(rank: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/ranks`, rank, {withCredentials: true});
  }


  addUnit(unitType: UnitType): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/unit-types`, unitType, {withCredentials: true});
  }


  deleteRank(name: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/ranks/${name}`, {withCredentials: true});
  }


  deleteUnitType(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/unit-types/${id}`, {withCredentials: true});
  }

  getPositionStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/position-statuses`, {withCredentials: true});
  }

  addPositionStatus(positionStatus: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/position-statuses`, positionStatus, {withCredentials: true});
  }

  deletePositionStatus(name: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/position-statuses/${name}`, {withCredentials: true});
  }
}

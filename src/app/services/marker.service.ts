import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
import {MapMarker} from '../models/marker.model';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {
  private apiUrl = `${environment.apiUrl}/api/markers`;  // Через проксі /api -> localhost:8080

  constructor(private http: HttpClient) {}

  getMarkers(): Observable<MapMarker[]> {
    return this.http.get<MapMarker[]>(this.apiUrl, { withCredentials: true });
  }

  addMarker(marker: Partial<MapMarker>): Observable<MapMarker> {
    return this.http.post<MapMarker>(this.apiUrl, marker, { withCredentials: true });
  }

  updateMarker(marker: MapMarker): Observable<MapMarker> {
    return this.http.patch<MapMarker>(`${this.apiUrl}/${marker.id}`, marker, { withCredentials: true });
  }
  deleteMarker(markerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${markerId}`, { withCredentials: true });
  }
}

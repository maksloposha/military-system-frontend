import {MapMarker} from '../models/marker.model';
import {Observable} from 'rxjs';
import {MapZone} from '../models/zone.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapZoneService {

  private apiUrl = `${environment.apiUrl}/api/zones`;

  constructor(private http: HttpClient) {}
  addZone(marker: Partial<MapZone>): Observable<MapZone> {
    return this.http.post<MapZone>(this.apiUrl, marker, { withCredentials: true });
  }

  getZones(): Observable<MapZone[]> {
    return this.http.get<MapZone[]>(this.apiUrl, { withCredentials: true });
  }

  updateZone(zone: MapZone): Observable<MapZone> {
    return this.http.patch<MapZone>(`${this.apiUrl}/${zone.id}`, zone, { withCredentials: true });
  }
  deleteZone(zoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${zoneId}`, { withCredentials: true });
  }
}

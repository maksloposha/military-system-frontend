import {MapZone} from '../models/zone.model';

export interface ZoneEvent {
  type: 'NEW_ZONE' | 'UPDATE' | 'DELETE';
  zone: MapZone;
}

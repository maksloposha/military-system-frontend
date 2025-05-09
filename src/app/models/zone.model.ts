export interface MapZone {
  id?: number;
  name: string;
  type: 'ALLY' | 'ENEMY' | 'NEUTRAL';
  coordinates: [number, number][];
}

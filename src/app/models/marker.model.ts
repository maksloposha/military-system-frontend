export interface MapMarker {
  id: number;
  name: string;
  type: string;
  description: string;
  latitude:  number;
  longitude: number ; // Point: { x, y } в PostGIS
  unitType: string; // UnitType
  commander: string;
  estimatedPersonnel: number;
}

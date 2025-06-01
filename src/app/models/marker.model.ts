import {UnitType} from './unitType.model';

export interface MapMarker {
  id: number;
  name: string;
  type: string;
  description: string;
  latitude:  number;
  longitude: number ;
  unitType: UnitType;
  commander: string;
  estimatedPersonnel: number;
  positionStatus: string;
}

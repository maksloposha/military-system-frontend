import {UnitType} from './unitType.model';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  rank: string;
  unitType: any;
  commander: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

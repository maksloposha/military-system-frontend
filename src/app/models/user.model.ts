export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  rank: string;
  unit: string;
  commander: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

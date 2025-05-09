import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import {MapComponent} from './pages/dashboard/map/map.component';
import {AdminComponent} from './pages/dashboard/admin/admin.component';
import {AuthGuard} from './auth/auth.guard';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {AwaitingApprovalComponent} from './auth/awaiting-approval/awaiting-approval.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'awaiting-approval', component: AwaitingApprovalComponent },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },// Додаємо маршрут для карти
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},// Додаємо маршрут для карти
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' } // fallback
];

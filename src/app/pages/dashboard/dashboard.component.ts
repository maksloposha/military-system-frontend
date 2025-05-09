import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {MapComponent} from './map/map.component';
import {AdminComponent} from './admin/admin.component';
import {ChatComponent} from './chat/chat.component';
import {ProfileComponent} from './profile/profile.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    MapComponent,
    AdminComponent,
    ChatComponent,
    ProfileComponent,
    NgIf
  ]
})
export class DashboardComponent {
  selectedTab: string = 'map';
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {
    this.authService.getCurrentUserRole().subscribe((response: any) => {
      this.isAdmin = response.role === 'ADMIN';
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  public logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logout successful!");
        window.location.reload();
      },
      error: (err) => {
        console.error("Logout failed", err);
      }
    });
  }
}

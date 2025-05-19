import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {UserSettingsService} from '../../../../services/user.settings.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-user-settings',
  imports: [
    FormsModule,
    NgForOf,
    RouterLink
  ],
  templateUrl: './user-settings.component.html',
  standalone: true,
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  newRank = '';
  newUnit = '';
  ranks: string[] = [];
  units: string[] = [];

  constructor(private adminService: UserSettingsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.adminService.getRanks().subscribe(data => this.ranks = data);
    this.adminService.getUnits().subscribe(data => this.units = data);
  }

  addRank(): void {
    if (this.newRank.trim()) {
      this.adminService.addRank(this.newRank.trim()).subscribe(() => {
        this.newRank = '';
        this.loadData();
      });
    }
  }

  addUnit(): void {
    if (this.newUnit.trim()) {
      this.adminService.addUnit(this.newUnit.trim()).subscribe(() => {
        this.newUnit = '';
        this.loadData();
      });
    }
  }

  goBack() {
    this.close.emit();
  }
}

import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/user.model';
import {ProfileComponent} from '../profile/profile.component';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {TranslatePipe} from '../../../translate.pipe';
import {FormsModule} from '@angular/forms';
import {TranslationService} from '../../../services/translation.service';
import {ConfirmDialogService} from '../../../utils/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, ProfileComponent, UserSettingsComponent, TranslatePipe, FormsModule]
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  loading = true;
  userId: number | null = null;
  editMode = false;
  userSettingsVisible = false;


  constructor(private userService: UserService, private translate: TranslationService, private confirmDialog: ConfirmDialogService) {
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users: User[]) => {
        this.users = users;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching users', error);
        this.loading = false;
      }
    );
  }

  approveUser(userId: number): void {
    this.userService.approveUser(userId).subscribe(() => {
      this.loadUsers();
    });
  }

  deleteUser(userId: number): void {
    this.confirmDialog.open(this.translate.instant('deleteUserConfirmation'), this.translate.instant('delete'), this.translate.instant('cancel'))
      .then((confirmed) => {
        if (confirmed) {
          this.userService.deleteUser(userId).subscribe(() => {
            this.loadUsers();
          });
        }
      });

  }

  editUser(user: User): void {
    this.userId = user.id;
    this.editMode = true;
  }

  isCurrentUser(user: User): boolean {

    const currentUserId = 1;
    return user.id === currentUserId;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.userId = null;
  }

  navigateToRanksAndUnits(): void {
    this.userSettingsVisible = true;
  }
}

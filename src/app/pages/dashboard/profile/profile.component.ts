import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {User} from '../../../models/user.model';
import {UserService} from '../../../services/user.service';
import {TranslatePipe} from '../../../translate.pipe';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    TranslatePipe
  ],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User = {} as User;
  profileForm: FormGroup;
  @Input() userId: number | null = null;
  @Output() onCancel = new EventEmitter<void>();


  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      rank: [''],
      unit: [''],
      status: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe((user) => {
        this.user = user;
        this.profileForm.patchValue({
          username: this.user.username,
          email: this.user.email,
          rank: this.user.rank,
          unit: this.user.unitType?.name,
          status: this.user.status
        });
      });
    } else {
      this.userService.getUserProfile().subscribe((user) => {
        this.user = user;
        this.profileForm.patchValue({
          username: this.user.username,
          email: this.user.email,
          rank: this.user.rank,
          unit: this.user.unitType?.name,
          status: this.user.status
        });
      });
    }
  }

  updateUserProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    if (this.userId) {
      const updatedUser = {...this.user, ...this.profileForm.value};
      this.userService.updateUser(this.userId,updatedUser).subscribe(
        (response) => {
          console.log('Profile updated successfully', response);
        },
        (error) => {
          console.error('Error updating profile', error);
        }
      );
    } else {

      const updatedUser = {...this.user, ...this.profileForm.value};

      this.userService.updateUserProfile(updatedUser).subscribe(
        (response) => {
          console.log('Profile updated successfully', response);
        },
        (error) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }

  cancelEdit() {
    this.profileForm.reset();
    this.loadUserProfile();
    this.onCancel.emit();
  }
}


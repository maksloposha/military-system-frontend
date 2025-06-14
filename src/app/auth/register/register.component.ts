import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
import {UserSettingsService} from '../../services/user.settings.service';
import {TranslatePipe} from '../../translate.pipe';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./../auth-style.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  errorMessage = '';
  successMessage = '';

  ranks: any[] = [];
  units: any[] = [];

  constructor(private userSettingServer: UserSettingsService) { }

  ngOnInit() {
    this.userSettingServer.getRanks().subscribe(data => this.ranks = data);
    this.userSettingServer.getUnits().subscribe(data => this.units = data);
  }


  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rank: ['', Validators.required],
    unit: ['', Validators.required],
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Registration submitted. Awaiting approval.';
        this.registerForm.reset();
      },
      error: (err) => {
        this.errorMessage = 'Registration failed.';
      }
    });
  }
}

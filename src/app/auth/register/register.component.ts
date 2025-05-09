import { Component, inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router'; // додати!


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./../auth-style.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  errorMessage = '';
  successMessage = '';

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

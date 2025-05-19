import {Component, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ChatEncryptionService} from '../../chat-utils/chat-encryption-service'; // додати!

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./../auth-style.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private chatEncryptionService: ChatEncryptionService) {
  }
  errorMessage = '';


  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    showPassword: [false]
  });

  get passwordVisible() {
    return this.loginForm.get('showPassword')?.value;
  }

  onSubmit() {
    console.log("something")
    if (!this.loginForm.invalid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log("Login successful!");
          this.chatEncryptionService.initKeys(this.loginForm.get('password')?.value!);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.error.status) {
            // Покажіть повідомлення залежно від статусу користувача
            switch (err.error.status) {
              case 'PENDING':
                this.errorMessage = 'Your account is pending approval.';
                break;
              case 'REJECTED':
                this.errorMessage = 'Your account has been rejected.';
                break;
              default:
                this.errorMessage = 'An error occurred. Please try again.';
            }
          } else {
            this.errorMessage = 'Invalid credentials.';
          }
        }
      });
    } else {
      this.errorMessage = 'Please fill in all fields';
    }
  }
}

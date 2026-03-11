import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {

  hidePassword = true;
  form; // ✅ se asigna en constructor
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(["/app/dashboard"]);
    }
  }

  login() {
    if (this.form.invalid) return;

    this.errorMsg = '';

    const { username, password } = this.form.value as { username: string; password: string };
    this.auth.login({ username, password }).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        console.error('Login error:', err);
        this.errorMsg = err?.error?.message ?? 'Credenciales inválidas';
      }
    });
  }
}

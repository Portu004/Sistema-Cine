import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Importaremos el AuthService más adelante cuando lo conectemos

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signal para controlar si mostramos Login o Registro
  isLoginMode = signal(true);

  // Formulario reactivo para el Login
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Formulario reactivo para el Registro 
  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    tipo_sangre: ['', Validators.required],
    color_ojos: ['', Validators.required],
    dias_vacaciones: [0, [Validators.required, Validators.min(0)]]
  });

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      console.log('Intento de login con:', this.loginForm.getRawValue());
    }
  }

  onSubmitRegister() {
    if (this.registerForm.valid) {
      console.log('Intento de registro con:', this.registerForm.getRawValue());
    }
  }
}
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service'; 

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
  private authService = inject(AuthService); // Inyección del servicio

  isLoginMode = signal(true);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

private soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
private formatoFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;


  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombre: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
    apellido: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
    fecha_nacimiento: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
    tipo_sangre: ['', Validators.required],
    color_ojos: ['', Validators.required],
    dias_vacaciones: [0, [Validators.required, Validators.min(0), Validators.max(365)]]
  });

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
  }

  async onSubmitLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      try {
        await this.authService.iniciarSesion(email, password);
        this.router.navigate(['/perfil']); 
      } catch (error: any) {
        alert('Error al iniciar sesión: ' + error.message);
      }
    }
  }

  async onSubmitRegister() {
    if (this.registerForm.valid) {
      try {
        await this.authService.registrarUsuario(this.registerForm.getRawValue());
        alert('¡Cuenta creada con éxito! Ya podés iniciar sesión.');
        this.toggleMode(); // Alterna automáticamente la vista a Login
      } catch (error: any) {
        alert('Error en el registro: ' + error.message);
      }
    }
  }
}
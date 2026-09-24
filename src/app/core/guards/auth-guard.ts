import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifico si hay una sesion activa en Supabase
  const session = await authService.obtenerSesion();

  if (session) {
    // Si hay sesión, lo dejo pasar a la ruta protegida
    return true;
  } else {
    // Si no hay sesion, lo saco de vuelta al Login
    router.navigate(['/auth']);
    return false;
  }
};
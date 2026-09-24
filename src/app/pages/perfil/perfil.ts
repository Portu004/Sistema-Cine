import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para manejar el estado y los datos
  usuario = signal<any>(null);
  cargando = signal(true);

  async ngOnInit() {
    try {
      const session = await this.authService.obtenerSesion();
      if (session?.user) {
        // Busco los datos en la tabla perfiles usando el ID de la sesión
        const perfilData = await this.authService.obtenerPerfilUsuario(session.user.id);
        this.usuario.set(perfilData);
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async logout() {
    await this.authService.cerrarSesion();
    this.router.navigate(['/auth']);
  }
}
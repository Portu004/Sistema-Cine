import { Router } from '@angular/router';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { PeliculasService } from '../../../core/services/peliculas/peliculas'; 
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo implements OnInit {
  private peliculasService = inject(PeliculasService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  peliculas: any[] = [];
  cargando: boolean = true;

  async ngOnInit() {
    try {
      this.peliculas = await this.peliculasService.obtenerPeliculasActivas();
      console.log('Películas desde Supabase:', this.peliculas);
    } catch (error: any) {
      console.error('Error al traer películas:', error.message);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  verDetalle(id: string) {
  this.router.navigate(['/pelicula', id]);
}
}
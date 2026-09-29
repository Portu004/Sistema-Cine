import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PeliculasService } from '../../../core/services/peliculas/peliculas';

@Component({
  selector: 'app-pelicula-detalle',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pelicula-detalle.html',
  styleUrl: './pelicula-detalle.scss'
})
export class PeliculaDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private peliculasService = inject(PeliculasService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  pelicula: any = null;
  cargando: boolean = true;
  funciones: any[] = [];
  funcionSeleccionada: any = null;

  async ngOnInit() {
    // ID que viene en la URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      try {
        // Buscamos solo esa pelicula en Supabase
        this.pelicula = await this.peliculasService.obtenerPeliculaPorId(id);
        console.log('Película traída de Supabase:', this.pelicula);
        this.funciones = await this.peliculasService.obtenerFuncionesPorPelicula(id);
        console.log('Funciones encontradas:', this.funciones);
      } catch (error) {
        console.error('Error al cargar la película:', error);
      } finally {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    }
  }

volver() {
  this.location.back(); // esto vuelve a la pagina anterior (el catalogo)
  }

irAButacas() {
    if (this.funcionSeleccionada) {
      this.router.navigate(['/butacas', this.funcionSeleccionada.id]);
    }
  }

seleccionarFuncion(funcion: any) {
    if (this.funcionSeleccionada && this.funcionSeleccionada.id === funcion.id) {
      this.funcionSeleccionada = null;
    } else {
      this.funcionSeleccionada = funcion;
    }
  }
}
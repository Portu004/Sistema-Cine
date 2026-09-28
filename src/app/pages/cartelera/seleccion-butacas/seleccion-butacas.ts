import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccion-butacas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-butacas.html',
  styleUrl: './seleccion-butacas.scss'
})
export class SeleccionButacas implements OnInit {
  private location = inject(Location);
  private router = inject(Router);

  // 20 filas (A hasta la T)
  filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  columnas = Array.from({length: 28}, (_, i) => i + 1);
  
  butacas: any[] = [];
  butacasSeleccionadas: any[] = [];

  ngOnInit() {
    this.generarMatrizAsientos();
  }

  generarMatrizAsientos() {
    for (let f of this.filas) {
      for (let c of this.columnas) {
        // Simulamos un 30% de probabilidad de que la butaca ya este ocupada
        const estaOcupada = Math.random() < 0.3;
        
        this.butacas.push({
          id: `${f}${c}`,
          estado: estaOcupada ? 'ocupado' : 'disponible'
        });
      }
    }
  }

  toggleButaca(butaca: any) {
    if (butaca.estado === 'ocupado') return; // Si esta ocupada, no hace nada

    if (butaca.estado === 'disponible') {
      butaca.estado = 'seleccionado';
      this.butacasSeleccionadas.push(butaca);
    } else if (butaca.estado === 'seleccionado') {
      butaca.estado = 'disponible';
      // La sacamos del array de seleccionadas
      this.butacasSeleccionadas = this.butacasSeleccionadas.filter(b => b.id !== butaca.id);
    }
  }

  volver() {
    this.location.back();
  }

  confirmarReserva() {
    if (this.butacasSeleccionadas.length > 0) {
      alert(`¡Entradas confirmadas! Butacas: ${this.butacasSeleccionadas.map(b => b.id).join(', ')}`);
      // Acá despues voy a hacer el this.router.navigate(['/checkout'])
    }
  }
}
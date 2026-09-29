import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

// --- INICIO CUSTOM VALIDATOR (RN-05) ---
export const validarButacasContiguas: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const seleccionadas = control.value as any[];
  
  if (!seleccionadas || seleccionadas.length <= 1) {
    return null; // Si hay 0 o 1 butaca, es válido
  }

  // 1. Mapeamos separando letra (fila) y número (columna)
  const butacasMapeadas = seleccionadas.map(b => ({
    fila: b.id.charAt(0),
    columna: parseInt(b.id.substring(1), 10)
  }));

  // 2. Verificamos que todas estén en la misma fila
  const filas = new Set(butacasMapeadas.map(b => b.fila));
  if (filas.size > 1) {
    return { noMismaFila: true };
  }

  // 3. Ordenamos por número de columna y verificamos que no haya huecos
  butacasMapeadas.sort((a, b) => a.columna - b.columna);
  for (let i = 0; i < butacasMapeadas.length - 1; i++) {
    if (butacasMapeadas[i + 1].columna - butacasMapeadas[i].columna !== 1) {
      return { noContiguas: true };
    }
  }

  return null; // Pasó todas las pruebas
};
// --- FIN CUSTOM VALIDATOR ---

@Component({
  selector: 'app-seleccion-butacas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './seleccion-butacas.html',
  styleUrl: './seleccion-butacas.scss'
})
export class SeleccionButacas implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);

  // 20 filas (A hasta la T)
  filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  columnas = Array.from({length: 28}, (_, i) => i + 1);

  reservaForm!: FormGroup;
  butacas: any[] = [];
  maxButacas = 6;

  ngOnInit() {
    // Inicializamos el formulario reactivo con un array vacío y nuestro Custom Validator
    this.reservaForm = this.fb.group({
      butacas_seleccionadas: [[], [validarButacasContiguas]]
    });

    this.generarMatrizAsientos();
  }

  generarMatrizAsientos() {
    for (let f of this.filas) {
      for (let c of this.columnas) {
        // Simulamos un 30% de probabilidad de que la butaca ya este ocupada (Provisorio)
        const estaOcupada = Math.random() < 0.3;
        
        this.butacas.push({
          id: `${f}${c}`,
          estado: estaOcupada ? 'ocupado' : 'disponible'
        });
      }
    }
  }

  // Getter útil para el HTML
  get butacasSeleccionadas() {
    return this.reservaForm.get('butacas_seleccionadas')?.value || [];
  }

  // Metodo para obtener los IDs en formato texto separado por comas para el HTML
  get nombresButacasSeleccionadas() {
    return this.butacasSeleccionadas.map((b: any) => b.id).join(', ');
  }

  toggleButaca(butaca: any) {
    if (butaca.estado === 'ocupado') return;

    let seleccionadasActuales = [...this.reservaForm.get('butacas_seleccionadas')?.value];

    if (butaca.estado === 'disponible') {
      if (seleccionadasActuales.length >= this.maxButacas) {
        alert(`Solo podés seleccionar un máximo de ${this.maxButacas} butacas por compra.`);
        return;
      }
      butaca.estado = 'seleccionado';
      seleccionadasActuales.push(butaca);
    } else if (butaca.estado === 'seleccionado') {
      butaca.estado = 'disponible';
      seleccionadasActuales = seleccionadasActuales.filter((b: any) => b.id !== butaca.id);
    }

    this.reservaForm.get('butacas_seleccionadas')?.setValue(seleccionadasActuales);
    this.reservaForm.get('butacas_seleccionadas')?.markAsTouched();
  }

  volver() {
    this.location.back();
  }

  confirmarReserva() {
    if (this.reservaForm.valid && this.butacasSeleccionadas.length > 0) {
      alert(`¡Entradas confirmadas! Butacas: ${this.nombresButacasSeleccionadas}`);
      // Acá después haremos el this.router.navigate(['/checkout'])
    }
  }
}
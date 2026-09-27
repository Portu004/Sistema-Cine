import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

const validarFechasCartelera = (control: AbstractControl): ValidationErrors | null => {
  const estreno = control.get('fecha_estreno')?.value;
  const salida = control.get('fecha_salida')?.value;

  if (estreno && salida) {
    const partesEstreno = estreno.split('/');
    const partesSalida = salida.split('/');

    if (partesEstreno.length === 3 && partesSalida.length === 3) {
      const fechaE = new Date(partesEstreno[2], partesEstreno[1] - 1, partesEstreno[0]);
      const fechaS = new Date(partesSalida[2], partesSalida[1] - 1, partesSalida[0]);

      // Si la fecha de salida es igual o menor al estreno, o si la diferencia es mayor a 3 meses (es un ejemplo limite)
      if (fechaS <= fechaE) {
        return { fechasIncoherentes: true };
      }
      
      // Limito a un maximo de 3 meses en cartelera para evitar el error de poner fecha de salida 2 años por ejemplo
      const tresMesesEnMs = 1000 * 60 * 60 * 24 * 90;
      if (fechaS.getTime() - fechaE.getTime() > tresMesesEnMs) {
        return { demasiadosDias: true };
      }
    }
  }
  return null;
};


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private fb = inject(FormBuilder);

  private formatoFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;

  peliculaForm = this.fb.nonNullable.group({
    titulo: ['', [Validators.required]],
    sinopsis: ['', [Validators.required, Validators.minLength(10)]],
    genero: ['', [Validators.required]],
    duracion: [0, [Validators.required, Validators.min(30), Validators.max(300)]],
    fecha_estreno: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
    fecha_salida: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
    precio_entrada: [0, [Validators.required, Validators.min(0),Validators.max(20000)]],
    poster_url: ['', [Validators.required]]
  }, { validators: validarFechasCartelera });



  onSubmitPelicula() {
    if (this.peliculaForm.valid) {
      console.log('Película lista para insertar:', this.peliculaForm.getRawValue());
    } else {
      this.peliculaForm.markAllAsTouched();
    }
  }
}
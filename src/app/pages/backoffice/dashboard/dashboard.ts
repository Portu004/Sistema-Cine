import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PeliculasService } from '../../../core/services/peliculas/peliculas';

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
  private peliculasService = inject(PeliculasService);

  private formatoFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;

  peliculaForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    sinopsis: ['', [Validators.required, Validators.minLength(10)]],
    generos: ['', [Validators.required]],
    duracion_minutos: [0, [Validators.required, Validators.min(30), Validators.max(300)]],
    clasificacion: ['', [Validators.required]],
    fecha_estreno: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
    fecha_salida: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
    precio_preventa: [0, [Validators.required, Validators.min(0),Validators.max(20000)]],
    imagen_url: ['', [Validators.required]]
  }, { validators: validarFechasCartelera });



async onSubmitPelicula() {
    if (this.peliculaForm.valid) {
      try {
        
        const nuevaPelicula: any = this.peliculaForm.getRawValue();

        // Traducimos fecha de estreno (De DD/MM/AAAA a AAAA-MM-DD)
        const [diaE, mesE, anioE] = nuevaPelicula.fecha_estreno.split('/');
        nuevaPelicula.fecha_estreno = `${anioE}-${mesE}-${diaE}`;

        // 3. Traducimos fecha de salida (De DD/MM/AAAA a AAAA-MM-DD)
        const [diaS, mesS, anioS] = nuevaPelicula.fecha_salida.split('/');
        nuevaPelicula.fecha_salida = `${anioS}-${mesS}-${diaS}`;

        nuevaPelicula.generos = [nuevaPelicula.generos];
        
        await this.peliculasService.crearPelicula(nuevaPelicula);
        
        alert('¡Película guardada en la cartelera con éxito!');
        
        // Limpio el formulario para poder cargar la siguiente pelicula al instante
        this.peliculaForm.reset();
        
      } catch (error: any) {
        console.error('Detalle del error:', error);
        alert('Error al guardar la película: ' + error.message);
      }
    } else {
      this.peliculaForm.markAllAsTouched();
    }
  }
}
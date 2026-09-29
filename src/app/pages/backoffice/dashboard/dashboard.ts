import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PeliculasService } from '../../../core/services/peliculas/peliculas';
import { CurrencyPipe } from '@angular/common';

const validarFechasCartelera = (control: AbstractControl): ValidationErrors | null => {
  const estreno = control.get('fecha_estreno')?.value;
  const salida = control.get('fecha_salida')?.value;
  if (estreno && salida) {
    const partesEstreno = estreno.split('/');
    const partesSalida = salida.split('/');
    if (partesEstreno.length === 3 && partesSalida.length === 3) {
      const fechaE = new Date(partesEstreno[2], partesEstreno[1] - 1, partesEstreno[0]);
      const fechaS = new Date(partesSalida[2], partesSalida[1] - 1, partesSalida[0]);
      
      if (fechaS <= fechaE) {
        return { fechasIncoherentes: true };
      }
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
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private fb = inject(FormBuilder);
  private peliculasService = inject(PeliculasService);
  private formatoFecha = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20)\d\d$/;
  private formatoHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // metricas simuladas 
  facturacionHoy: number = 245000;
  entradasVendidasHoy: number = 54;
  peliculasEnCartelera: number = 8;

  // formulario de peliculas
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

  // manejo de funciones
  funcionForm!: FormGroup;
  peliculasDisponibles: any[] = [];

  ngOnInit() {
    this.funcionForm = this.fb.group({
      pelicula_id: ['', Validators.required],
      sala_id: ['1', Validators.required],
      fecha_inicio: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
      hora_inicio: ['', [Validators.required, Validators.pattern(this.formatoHora)]],
      fecha_fin: ['', [Validators.required, Validators.pattern(this.formatoFecha)]],
      hora_fin: ['', [Validators.required, Validators.pattern(this.formatoHora)]],
      formato: ['2D', Validators.required],
      idioma: ['Castellano', Validators.required]
    });

    this.cargarPeliculasParaSelect();
  }

  async cargarPeliculasParaSelect() {
    try {
      this.peliculasDisponibles = await this.peliculasService.obtenerPeliculasActivas();
    } catch (error) {
      console.error('Error al cargar películas:', error);
    }
  }

  async onSubmitPelicula() {
    if (this.peliculaForm.valid) {
      try {
        const nuevaPelicula: any = this.peliculaForm.getRawValue();
        const [diaE, mesE, anioE] = nuevaPelicula.fecha_estreno.split('/');
        nuevaPelicula.fecha_estreno = `${anioE}-${mesE}-${diaE}`;
        
        const [diaS, mesS, anioS] = nuevaPelicula.fecha_salida.split('/');
        nuevaPelicula.fecha_salida = `${anioS}-${mesS}-${diaS}`;
        nuevaPelicula.generos = [nuevaPelicula.generos];
        
        await this.peliculasService.crearPelicula(nuevaPelicula);
        alert('¡Película guardada en la cartelera con éxito!');
        this.peliculaForm.reset();
        
        // recargo la lista del select para que aparezca la peli nueva
        this.cargarPeliculasParaSelect();
      } catch (error: any) {
        console.error('Detalle del error:', error);
        alert('Error al guardar la película: ' + error.message);
      }
    } else {
      this.peliculaForm.markAllAsTouched();
    }
  }

async guardarFuncion() {
    if (this.funcionForm.valid) {
      try {
        const valoresForm = this.funcionForm.value;
        
       // armo objetos Date reales de js para que manejen el uso Horario (UTC-3)
        const [diaI, mesI, anioI] = valoresForm.fecha_inicio.split('/');
        const [horaI, minI] = valoresForm.hora_inicio.split(':');
        // usando date de js los meses van de 0 a 11, por eso resto 1 al mes
        const fechaInicioObj = new Date(Number(anioI), Number(mesI) - 1, Number(diaI), Number(horaI), Number(minI));

        const [diaF, mesF, anioF] = valoresForm.fecha_fin.split('/');
        const [horaF, minF] = valoresForm.hora_fin.split(':');
        const fechaFinObj = new Date(Number(anioF), Number(mesF) - 1, Number(diaF), Number(horaF), Number(minF));

        // armo el objeto final
        const datosFuncion = {
          pelicula_id: Number(valoresForm.pelicula_id),
          sala_id: Number(valoresForm.sala_id),
          fecha_hora_inicio: fechaInicioObj.toISOString(),
          fecha_hora_fin: fechaFinObj.toISOString(),
          formato: valoresForm.formato,
          idioma: valoresForm.idioma
        };

        // validacion para respertar intervalo de 30 mins
        const peliculaSeleccionada = this.peliculasDisponibles.find(p => p.id === datosFuncion.pelicula_id);
        if (!peliculaSeleccionada) {
          alert('Error: No se encontró la película seleccionada.');
          return;
        }

        const estaDisponible = await this.peliculasService.validarDisponibilidadSala(
          datosFuncion.sala_id,
          fechaInicioObj,
          peliculaSeleccionada.duracion_minutos
        );

        if (!estaDisponible) {
          alert('⚠️ Error de asignación: La sala está ocupada o no se respeta el intervalo mínimo de 30 minutos.');
          return; 
        }
        

        await this.peliculasService.crearFuncion(datosFuncion);
        alert('¡Función programada con éxito!');
        this.funcionForm.reset({ sala_id: '1', formato: '2D', idioma: 'Castellano' });
      } catch (error: any) {
        console.error('Error al guardar la función:', error);
        alert('Hubo un error al guardar.');
      }
    } else {
      this.funcionForm.markAllAsTouched();
    }
  }
}
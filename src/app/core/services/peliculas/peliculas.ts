import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
providedIn: 'root'
})
export class PeliculasService {
private supabase: SupabaseClient;

constructor() {
    // inicializo Supabase 
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
}

async crearPelicula(pelicula: any) {
    const { data, error } = await this.supabase
    .from('peliculas')
    .insert(pelicula);

    if (error) throw error;
    return data;
  }

async obtenerPeliculasActivas() {
    // fecha de hoy en formato AAAA-MM-DD para comparar con la base
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*')
      .gte('fecha_salida', hoy) 
      .order('fecha_estreno', { ascending: false }); // ordeno por las mas nuevas
      
    if (error) throw error;
    return data;
  }

async obtenerPeliculaPorId(id: string) {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*')
      .eq('id', id)
      .single(); // traigo un solo objeto, no un array
      
    if (error) throw error;
    return data;
  }

async obtenerFuncionesPorPelicula(peliculaId: string) {
    const { data, error } = await this.supabase
      .from('funciones')
      .select('*')
      .eq('pelicula_id', peliculaId)
      .order('fecha_hora_inicio', { ascending: true }); // ordeno por horario
      
    if (error) throw error;
    return data;
  }

async crearFuncion(funcion: any) {
    const { data, error } = await this.supabase
      .from('funciones')
      .insert(funcion);
      
    if (error) throw error;
    return data;
  }


async validarDisponibilidadSala(salaId: number, fechaHoraInicioNueva: Date, duracionPeliculaMinutos: number): Promise<boolean> {
    // calculo cuando termina la peli nueva + los 30 minutos obligatorios 
    const finConIntervalo = new Date(fechaHoraInicioNueva);
    finConIntervalo.setMinutes(finConIntervalo.getMinutes() + duracionPeliculaMinutos + 30);

    // traigo todas las funciones de la sala para ese mismo dia
    const inicioDia = new Date(fechaHoraInicioNueva);
    inicioDia.setHours(0,0,0,0);
    const finDia = new Date(fechaHoraInicioNueva);
    finDia.setHours(23,59,59,999);

    const { data: funcionesExistentes, error } = await this.supabase
      .from('funciones')
      .select('fecha_hora_inicio, peliculas(duracion_minutos)')
      .eq('sala_id', salaId)
      .gte('fecha_hora_inicio', inicioDia.toISOString())
      .lte('fecha_hora_inicio', finDia.toISOString());

    if (error) throw error;
    if (!funcionesExistentes || funcionesExistentes.length === 0) return true; // la sala esta libre todo el dia

    // verifico la superposicion aca
    for (const func of funcionesExistentes) {
      const inicioExistente = new Date(func.fecha_hora_inicio);
      const finExistente = new Date(inicioExistente);
      const peli = func.peliculas as any;
      finExistente.setMinutes(finExistente.getMinutes() + peli.duracion_minutos + 30); // Sumamos los 30 min de limpieza de la que ya existe

      // si la nueva empieza ANTES de que termine la existente (con su limpieza), 
      // y termina DESPUES de que empieza la existente, hay un problema.
      if (fechaHoraInicioNueva < finExistente && finConIntervalo > inicioExistente) {
        return false; // hay superposicion
      }
    }
    return true; // paso las validaciones
  }









}
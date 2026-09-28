import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
providedIn: 'root'
})
export class PeliculasService {
private supabase: SupabaseClient;

constructor() {
    // Inicializo Supabase 
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
    // Obtenemos la fecha de hoy en formato AAAA-MM-DD para comparar con la base
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*')
      .gte('fecha_salida', hoy) 
      .order('fecha_estreno', { ascending: false }); // Ordenamos por las mas nuevas
      
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
      .order('fecha_hora_inicio', { ascending: true }); // Las ordenamos por horario
      
    if (error) throw error;
    return data;
  }


}
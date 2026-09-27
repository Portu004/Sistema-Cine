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
}
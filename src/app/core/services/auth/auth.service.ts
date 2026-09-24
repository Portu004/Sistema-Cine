import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
providedIn: 'root'
})
export class AuthService {
private supabase: SupabaseClient;

constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
}

async registrarUsuario(datos: any) {
    // 1. Creo el usuario en el sistema de Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    });

    if (authError) throw authError;

    // 2. Inserto la informacion obligatoria en la tabla perfiles
    if (authData.user) {
    const { error: dbError } = await this.supabase.from('perfiles').insert({
        id: authData.user.id,
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        fecha_nacimiento: datos.fecha_nacimiento,
        tipo_sangre: datos.tipo_sangre,
        color_ojos: datos.color_ojos,
        dias_vacaciones: datos.dias_vacaciones,
        rol: 'cliente_registrado'
    });
    
    if (dbError) throw dbError;
    }
    return authData;
}

async iniciarSesion(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
    email,
    password
    });
    
    if (error) throw error;
    return data;
}

// se fija si supabase tiene un token valido en su navegador
async obtenerSesion() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

async cerrarSesion() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
}

async obtenerPerfilUsuario(userId: string) {
    const { data, error } = await this.supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();
    
    if (error) throw error;
    return data;
}


}
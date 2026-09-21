import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { User } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabase = inject(SupabaseService).client;

    // Con esto se quien esta esta logueado
currentUser = signal<User | null>(null);

constructor() {
    // Actualizo en tiempo real si el usuario entra o sale
    this.supabase.auth.onAuthStateChange((event, session) => {
    this.currentUser.set(session?.user || null);
    });
}


async registrarPrimerAdmin(email: string, password: string, nombre: string, apellido: string) {
    //Creo el usuario en el motor de autenticacion de Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
    email,
    password
    });
    
    if (authError) throw authError;

    //Creo el usuario forzando el rol admin vinculando el id
    if (authData.user) {
    const { error: profileError } = await this.supabase.from('perfiles').insert({
        id: authData.user.id,
        email: email,
        nombre: nombre,
        apellido: apellido,
        rol: 'admin' 
    });
    
    if (profileError) throw profileError;
    }
    
    return authData;
    }
}
import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    
    { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil), canActivate: [authGuard] },

    { path: '', loadComponent: () => import('./pages/cartelera/catalogo/catalogo').then(m => m.Catalogo) },

    { path: 'pelicula/:id', loadComponent: () => import('./pages/cartelera/pelicula-detalle/pelicula-detalle').then(m => m.PeliculaDetalle) },

    { path: 'butacas/:id', loadComponent: () => import('./pages/cartelera/seleccion-butacas/seleccion-butacas').then(m => m.SeleccionButacas) },

    { path: 'admin', loadComponent: () => import('./pages/backoffice/dashboard/dashboard').then(m => m.Dashboard) }


];

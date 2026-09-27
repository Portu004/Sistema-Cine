import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    
    { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil), canActivate: [authGuard] },

    { path: '', redirectTo: 'auth', pathMatch: 'full' },

    { path: 'admin', loadComponent: () => import('./pages/backoffice/dashboard/dashboard').then(m => m.Dashboard) }


];

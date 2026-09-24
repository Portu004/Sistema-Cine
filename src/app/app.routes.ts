import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';

export const routes: Routes = [
{ path: 'auth', component: AuthComponent },
{ path: '', redirectTo: 'auth', pathMatch: 'full' }
];

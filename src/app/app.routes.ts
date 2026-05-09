import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const APP_ROUTES: Routes = [
    { 
        path: '', redirectTo: 'login', pathMatch: 'full', 
    },
    {
        path: 'login',
        loadComponent: () => import('./modules/login-component/login-component').then(c => c.LoginComponent)
    },
    {
        path: 'user',
        // canActivate: [authGuard],
        data: { expectedRoles: ['admin'] },
        loadChildren: () => import('./routes/user.routes').then(r => r.USER_ROUTES)
    }, 
    {
        path: 'access-denied',
        // canActivate: [authGuard],
        loadComponent: () => import('./components/access-denied-component/access-denied-component').then(c => c.AccessDeniedComponent)
    },
];

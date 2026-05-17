import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@rdpms/core/guards';

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
        canMatch: [authGuard, roleGuard],
        data: { roles: ['admin', 'master'] },
        loadChildren: () => import('./routes/user.routes').then(r => r.USER_ROUTES)
    }, 
    {
        path: 'access-denied',
        loadComponent: () => import('./components/access-denied-component/access-denied-component').then(c => c.AccessDeniedComponent)
    },
];

import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';

export const USER_ROUTES: Routes = [
    {
        path: '',
        // canActivateChild: [authGuard],
        loadComponent: () => import('../modules/user-component/user-component').then(c => c.UserComponent),
        children: [
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            {
                path: 'home',
                data: { title: 'Home', icon: 'bi-house', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/home-component/home-component').then(c => c.HomeComponent)
            },
            {
                path: 'user',
                data: { expectedRoles: ['admin'] },
                loadComponent: () => import('../components/home-component/home-component').then(c => c.HomeComponent)
            },
            {
                path: 'admin',
                data: { expectedRoles: ['admin'] },
                loadComponent: () => import('../components/home-component/home-component').then(c => c.HomeComponent)
            }, 
            {
                path: 'alert',
                data: { title: 'Alerts', icon: 'bi-bell', menu: true },
                loadChildren: () => import('../routes/alert.routes').then(r => r.ALERT_ROUTES)
            },
            {
                path: 'telemetry',
                data: { title: 'Telemetry', icon: 'bi-graph-up', menu: true },
                loadChildren: () => import('../routes/telemetry.routes').then(r => r.TELEMETRY_ROUTES)
            },
            {
                path: 'sensor',
                data: { title: 'IOT/Sensor', icon: 'bi-hdd-network', menu: true },
                loadChildren: () => import('../routes/sensor.routes').then(r => r.SENSOR_ROUTES)
            },
            {
                path: 'asset',
                data: { title: 'Asset', icon: 'bi-tag', menu: true },
                loadChildren: () => import('../routes/asset.routes').then(r => r.ASSET_ROUTES)
            },      
        ]
    },
];

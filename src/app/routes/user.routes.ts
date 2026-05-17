import { Routes } from '@angular/router';
import { roleGuard, unsavedChangesGuard } from '@rdpms/core/guards';

export const USER_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [roleGuard],
        loadComponent: () => import('../modules/user-component/user-component').then(c => c.UserComponent),
        children: [
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            {
                path: 'home',
                canDeactivate: [unsavedChangesGuard],
                data: { title: 'Home', icon: 'bi-house', menu: true, roles: ['admin'] },
                loadComponent: () => import('../components/home-component/home-component').then(c => c.HomeComponent),
            },
            {
                path: 'admin',
                data: { roles: ['admin'] },
                loadComponent: () => import('../components/home-component/home-component').then(c => c.HomeComponent)
            }, 
            {
                path: 'alert',
                data: { title: 'Alerts', icon: 'bi-bell', menu: true, roles: ['admin'] },
                loadChildren: () => import('../routes/alert.routes').then(r => r.ALERT_ROUTES)
            },
            {
                path: 'telemetry',
                data: { title: 'Telemetry', icon: 'bi-graph-up', menu: true, roles: ['admin'] },
                loadChildren: () => import('../routes/telemetry.routes').then(r => r.TELEMETRY_ROUTES)
            },
            {
                path: 'sensor',
                data: { title: 'IOT/Sensor', icon: 'bi-hdd-network', menu: true, roles: ['admin'] },
                loadChildren: () => import('../routes/sensor.routes').then(r => r.SENSOR_ROUTES)
            },
            {
                path: 'asset',
                data: { title: 'Asset', icon: 'bi-tag', menu: true, roles: ['admin'] },
                loadChildren: () => import('../routes/asset.routes').then(r => r.ASSET_ROUTES)
            },      
        ]
    },
];

import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';

export const SENSOR_ROUTES: Routes = [
    {
        path: '',
        // canActivateChild: [authGuard],
        loadComponent: () => import('../components/sensor-component/sensor-component').then(c => c.SensorComponent),
        children: [
            {
                path: '', redirectTo: 'live', pathMatch: 'full'
            },
            {
                path: 'live',
                data: { title: 'IOT/Sensor Live', icon: 'bi-cpu', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/sensor-component/sensor-live-component/sensor-live-component').then(c => c.SensorLiveComponent)
            },
            {
                path: 'detail-report',
                data: { title: 'IOT/Sensor Detail Report', icon: 'bi-file-earmark-medical', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/sensor-component/sensor-detail-report-component/sensor-detail-report-component').then(c => c.SensorDetailReportComponent)
            },
        ]
    },
];

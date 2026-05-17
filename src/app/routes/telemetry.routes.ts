import { Routes } from '@angular/router';

export const TELEMETRY_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../components/telemetry-component/telemetry-component').then(c => c.TelemetryComponent),
        children: [
            {
                path: '', redirectTo: 'live', pathMatch: 'full'
            },
            {
                path: 'live',
                data: { title: 'Telemerty Live', icon: 'bi-broadcast', menu: true, roles: ['admin'] },
                loadComponent: () => import('../components/telemetry-component/telemetry-live-component/telemetry-live-component').then(c => c.TelemetryLiveComponent)
            },
            {
                path: 'history',
                data: { title: 'Telemerty History', icon: 'bi-clock-history', menu: true, roles: ['admin'] },
                loadComponent: () => import('../components/telemetry-component/telemetry-history-component/telemetry-history-component').then(c => c.TelemetryHistoryComponent)
            },
        ]
    },
];

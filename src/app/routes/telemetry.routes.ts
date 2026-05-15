import { Routes } from '@angular/router';
import { authGuard } from '@rdpms/core/guards';

export const TELEMETRY_ROUTES: Routes = [
    {
        path: '',
        // canActivateChild: [authGuard],
        loadComponent: () => import('../components/telemetry-component/telemetry-component').then(c => c.TelemetryComponent),
        children: [
            {
                path: '', redirectTo: 'live', pathMatch: 'full'
            },
            {
                path: 'live',
                data: { title: 'Telemerty Live', icon: 'bi-broadcast', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/telemetry-component/telemetry-live-component/telemetry-live-component').then(c => c.TelemetryLiveComponent)
            },
            {
                path: 'history',
                data: { title: 'Telemerty History', icon: 'bi-clock-history', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/telemetry-component/telemetry-history-component/telemetry-history-component').then(c => c.TelemetryHistoryComponent)
            },
        ]
    },
];

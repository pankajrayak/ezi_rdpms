import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';

export const ALERT_ROUTES: Routes = [
    {
        path: '',
        // canActivateChild: [authGuard],
        loadComponent: () => import('../components/alert-component/alert-component').then(c => c.AlertComponent),
        children: [
            {
                path: '', redirectTo: 'live', pathMatch: 'full'
            },
            {
                path: 'live',
                loadComponent: () => import('../components/alert-component/alert-live-component/alert-live-component').then(c => c.AlertLiveComponent),
                data: { title: 'Alert Live', icon: 'bi-activity', menu: true, expectedRoles: ['admin'], preload: true },
            },
            {
                path: 'detail-report',
                loadComponent: () => import('../components/alert-component/alert-detail-report-component/alert-detail-report-component').then(c => c.AlertDetailReportComponent),
                data: { title: 'Alert Detail Report', icon: 'bi-file-earmark-bar-graph', menu: true, expectedRoles: ['admin'], preload: true },
            },
            {
                path: 'summary-report',
                loadComponent: () => import('../components/alert-component/alert-summary-report-component/alert-summary-report-component').then(c => c.AlertSummaryReportComponent),
                data: { title: 'Alert Summary Report', icon: 'bi-collection-play', menu: true, expectedRoles: ['admin'], preload: true },
            }, 
        ]
    },
];

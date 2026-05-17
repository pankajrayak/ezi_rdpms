import { Routes } from '@angular/router';

export const ALERT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../components/alert-component/alert-component').then(c => c.AlertComponent),
        children: [
            {
                path: '', redirectTo: 'live', pathMatch: 'full'
            },
            {
                path: 'live',
                data: { title: 'Alert Live', icon: 'bi-activity', menu: true, preload: true, roles: ['admin'] },
                loadComponent: () => import('../components/alert-component/alert-live-component/alert-live-component').then(c => c.AlertLiveComponent),
            },
            {
                path: 'detail-report',
                data: { title: 'Alert Detail Report', icon: 'bi-file-earmark-bar-graph', menu: true, preload: true, roles: ['admin'] },
                loadComponent: () => import('../components/alert-component/alert-detail-report-component/alert-detail-report-component').then(c => c.AlertDetailReportComponent),
            },
            {
                path: 'summary-report',
                data: { title: 'Alert Summary Report', icon: 'bi-collection-play', menu: true, preload: true, roles: ['admin'] },
                loadComponent: () => import('../components/alert-component/alert-summary-report-component/alert-summary-report-component').then(c => c.AlertSummaryReportComponent),
            }, 
        ]
    },
];

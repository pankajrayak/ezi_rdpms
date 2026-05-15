import { Routes } from '@angular/router';
import { authGuard } from '@rdpms/core/guards';

export const ASSET_ROUTES: Routes = [
    {
        path: '',
        // canActivateChild: [authGuard],
        loadComponent: () => import('../components/asset-component/asset-component').then(c => c.AssetComponent),
        children: [
            {
                path: '', redirectTo: 'detail-report', pathMatch: 'full'
            },
            {
                path: 'utilization',
                data: { title: 'Asset Utilization', icon: 'bi-bar-chart-steps', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/asset-component/asset-utilization-component/asset-utilization-component').then(c => c.AssetUtilizationComponent)
            },
            {
                path: 'detail-report',
                data: { title: 'Asset Detail Report', icon: 'bi-journal-text', menu: true, expectedRoles: ['admin'] },
                loadComponent: () => import('../components/asset-component/asset-detail-report-component/asset-detail-report-component').then(c => c.AssetDetailReportComponent)
            },
        ]
    },
];

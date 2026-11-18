import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: 'overview', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { title: 'Overview', eyebrow: 'WORKSPACE' } },
  { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent), data: { title: 'Inventory', eyebrow: 'CATALOG MANAGEMENT' } },
  { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent), data: { title: 'Orders', eyebrow: 'ORDER OPERATIONS' } },
  { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent), data: { title: 'Analytics', eyebrow: 'PERFORMANCE' } },
  { path: '**', redirectTo: 'overview' }
];

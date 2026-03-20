import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { module: 'dashboard' },
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'inventario',
        canActivate: [roleGuard],
        data: { module: 'inventario' },
        loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { module: 'usuarios' },
        loadComponent: () => import('./features/usuarios/usuarios').then(m => m.UsuariosComponent)
      },
      {
        path: 'vehiculos-nuevos',
        canActivate: [roleGuard],
        data: { module: 'vehiculos-nuevos' },
        loadComponent: () => import('./features/vehiculos-nuevos/vehiculos-nuevos').then(m => m.VehiculosNuevosComponent)
      },
      { path: 'vehiculos', redirectTo: 'vehiculos-nuevos', pathMatch: 'full' },
      {
        path: 'contabilidad',
        children: [
          {
            path: 'facturacion',
            canActivate: [roleGuard],
            data: { module: 'facturacion' },
            loadComponent: () => import('./features/contabilidad/facturacion/facturacion').then(m => m.FacturacionComponent)
          },
          {
            path: 'compras',
            canActivate: [roleGuard],
            data: { module: 'compras' },
            loadComponent: () => import('./features/contabilidad/compras/compras').then(m => m.ComprasComponent)
          },
          {
            path: 'guias',
            canActivate: [roleGuard],
            data: { module: 'guias' },
            loadComponent: () => import('./features/contabilidad/guias/guias').then(m => m.GuiasComponent)
          },
          { path: '', redirectTo: 'facturacion', pathMatch: 'full' }
        ]
      },
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { module: 'clientes' },
        loadComponent: () => import('./features/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'servicios-mecanicos',
        canActivate: [roleGuard],
        data: { module: 'servicios-mecanicos' },
        loadComponent: () => import('./features/servicios-mecanicos/ordenes-servicio/ordenes-servicio').then(m => m.OrdenesServicioComponent)
      },
      { path: 'servicios', redirectTo: 'servicios-mecanicos', pathMatch: 'full' },
      { path: 'servicios-mecánicos', redirectTo: 'servicios-mecanicos', pathMatch: 'full' },
      {
        path: 'servicios-mecanicos/:id',
        canActivate: [roleGuard],
        data: { module: 'servicios-mecanicos' },
        loadComponent: () => import('./features/servicios-mecanicos/orden-servicio-detalle/orden-servicio-detalle').then(m => m.OrdenServicioDetalleComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

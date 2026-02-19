import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login fuera del layout
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login')
        .then(m => m.LoginComponent)
  },

  // Todo lo demás dentro del layout (menú)
  {
    path: 'app',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario.component')
            .then(m => m.InventarioComponent)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios')
            .then(m => m.UsuariosComponent)
      },

      {
        path: 'vehiculos-nuevos',
        loadComponent: () =>
          import('./features/vehiculos-nuevos/vehiculos-nuevos')
            .then(m => m.VehiculosNuevosComponent)
      },

      // cuando entres a /app, cae al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];

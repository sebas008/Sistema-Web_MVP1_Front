import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, firstValueFrom, of } from 'rxjs';
import { catchError, filter, takeUntil, timeout } from 'rxjs/operators';
import { InventarioRepuestosService } from '../../core/services/inventario-repuestos';
import { VehiculosNuevosService } from '../../core/services/vehiculos-nuevos';
import { FacturacionService } from '../../core/services/contabilidad/facturacion';
import { ClientesService } from '../../core/services/clientes';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private stockApi = inject(InventarioRepuestosService);
  private vehiculosApi = inject(VehiculosNuevosService);
  private facturasApi = inject(FacturacionService);
  private clientesApi = inject(ClientesService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private destroy$ = new Subject<void>();
  loading = false;
  kpis = [
    { title: 'Repuestos en stock', value: '—', icon: 'inventory_2' },
    { title: 'Vehículos nuevos', value: '—', icon: 'directions_car' },
    { title: 'Facturas hoy', value: '—', icon: 'receipt_long' },
    { title: 'Clientes', value: '—', icon: 'badge' },
  ];
  quickLinks = [
    { route: '/app/usuarios', icon: 'group', label: 'Usuarios', module: 'usuarios' },
    { route: '/app/inventario', icon: 'inventory_2', label: 'Inventario', module: 'inventario' },
    { route: '/app/vehiculos-nuevos', icon: 'directions_car', label: 'Vehículos', module: 'vehiculos-nuevos' },
    { route: '/app/contabilidad/facturacion', icon: 'receipt_long', label: 'Facturación', module: 'facturacion' },
    { route: '/app/contabilidad/compras', icon: 'shopping_cart', label: 'Compras', module: 'compras' },
    { route: '/app/contabilidad/guias', icon: 'local_shipping', label: 'Guías', module: 'guias' },
    { route: '/app/clientes', icon: 'person', label: 'Clientes', module: 'clientes' },
  ];
  private refreshHandle?: ReturnType<typeof setInterval>;
  ngOnInit(): void {
    this.cargar();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntil(this.destroy$)).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      if (url === '/app/dashboard' || url === '/app') this.cargar(true);
    });
    this.refreshHandle = setInterval(() => this.cargar(), 60000);
  }
  ngOnDestroy(): void {
    if (this.refreshHandle) clearInterval(this.refreshHandle);
    this.destroy$.next();
    this.destroy$.complete();
  }
  can(moduleKey: string): boolean { return this.auth.canAccess(moduleKey); }
  async cargar(force = false): Promise<void> {
    if (this.loading && !force) return;
    const today = new Date().toISOString().slice(0, 10);
    this.loading = true;
    const toArr = (x: any) => Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : Array.isArray(x?.data) ? x.data : [];
    const safeRequest = <T>(obs: any, fallback: T): Promise<T> => firstValueFrom(obs.pipe(timeout(8000), catchError(() => of(fallback))));
    try {
      const [stock, vehiculos, facturas, clientes] = await Promise.all([
        safeRequest(this.stockApi.listarStock(null), []),
        safeRequest(this.vehiculosApi.listar(null, true), []),
        safeRequest(this.facturasApi.listar(null), []),
        safeRequest(this.clientesApi.listar(null, true), []),
      ]);
      const facturasHoy = toArr(facturas).filter((f: any) => String(f?.fecha ?? '').slice(0, 10) === today);
      this.kpis = [
        { title: 'Repuestos en stock', value: String(toArr(stock).length), icon: 'inventory_2' },
        { title: 'Vehículos nuevos', value: String(toArr(vehiculos).length), icon: 'directions_car' },
        { title: 'Facturas hoy', value: String(facturasHoy.length), icon: 'receipt_long' },
        { title: 'Clientes', value: String(toArr(clientes).length), icon: 'badge' },
      ];
    } finally { this.loading = false; }
  }
}

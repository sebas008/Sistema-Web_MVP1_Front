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
  private destroy$ = new Subject<void>();

  loading = false;

  kpis = [
    { title: 'Repuestos en stock', value: '—', icon: 'inventory_2' },
    { title: 'Vehículos nuevos', value: '—', icon: 'directions_car' },
    { title: 'Facturas hoy', value: '—', icon: 'receipt_long' },
    { title: 'Clientes', value: '—', icon: 'badge' },
  ];

  private refreshHandle?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.cargar();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url === '/app/dashboard' || url === '/app') {
          this.cargar(true);
        }
      });

    this.refreshHandle = setInterval(() => this.cargar(), 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshHandle) clearInterval(this.refreshHandle);
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargar(force = false): Promise<void> {
    if (this.loading && !force) return;

    const today = new Date().toISOString().slice(0, 10);
    this.loading = true;

    const toArr = (x: any) => {
      if (Array.isArray(x)) return x;
      if (Array.isArray(x?.items)) return x.items;
      if (Array.isArray(x?.data)) return x.data;
      return [];
    };

    const safeRequest = <T>(obs: any, fallback: T): Promise<T> =>
      firstValueFrom(
        obs.pipe(
          timeout(8000),
          catchError(() => of(fallback))
        )
      );

    try {
      const [stock, vehiculos, facturas, clientes] = await Promise.all([
        safeRequest(this.stockApi.listarStock(null), []),
        safeRequest(this.vehiculosApi.listar(null, true), []),
        safeRequest(this.facturasApi.listar(null), []),
        safeRequest(this.clientesApi.listar(null, true), []),
      ]);

      const stockArr = toArr(stock);
      const vehiculosArr = toArr(vehiculos);
      const facturasArr = toArr(facturas);
      const clientesArr = toArr(clientes);

      const facturasHoy = facturasArr.filter((f: any) => {
        const fecha = f?.fecha;
        const s = typeof fecha === 'string' ? fecha : (fecha?.toString?.() ?? '');
        return s.slice(0, 10) === today;
      });

      this.kpis = [
        { title: 'Repuestos en stock', value: String(stockArr.length), icon: 'inventory_2' },
        { title: 'Vehículos nuevos', value: String(vehiculosArr.length), icon: 'directions_car' },
        { title: 'Facturas hoy', value: String(facturasHoy.length), icon: 'receipt_long' },
        { title: 'Clientes', value: String(clientesArr.length), icon: 'badge' },
      ];
    } catch {
      this.kpis = [
        { title: 'Repuestos en stock', value: '0', icon: 'inventory_2' },
        { title: 'Vehículos nuevos', value: '0', icon: 'directions_car' },
        { title: 'Facturas hoy', value: '0', icon: 'receipt_long' },
        { title: 'Clientes', value: '0', icon: 'badge' },
      ];
    } finally {
      this.loading = false;
    }
  }
}

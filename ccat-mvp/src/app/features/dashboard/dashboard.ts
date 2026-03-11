import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
export class DashboardComponent {
  private stockApi = inject(InventarioRepuestosService);
  private vehiculosApi = inject(VehiculosNuevosService);
  private facturasApi = inject(FacturacionService);
  private clientesApi = inject(ClientesService);

  loading = false;

  kpis = [
    { title: 'Repuestos en stock', value: '—', icon: 'inventory_2' },
    { title: 'Vehículos nuevos', value: '—', icon: 'directions_car' },
    { title: 'Facturas hoy', value: '—', icon: 'receipt_long' },
    { title: 'Clientes', value: '—', icon: 'badge' },
  ];

  constructor() {
    this.cargar();
  }

  cargar() {
    if (this.loading) return;

    const today = new Date().toISOString().slice(0, 10);
    this.loading = true;

    forkJoin({
      stock: this.stockApi.listarStock(null).pipe(catchError(() => of([]))),
      vehiculos: this.vehiculosApi.listar(null, true).pipe(catchError(() => of([]))),
      facturas: this.facturasApi.listar(null).pipe(catchError(() => of([]))),
      clientes: this.clientesApi.listar(null, true).pipe(catchError(() => of([]))),
    })
      .pipe(
        map(({ stock, vehiculos, facturas, clientes }) => {
          const toArr = (x: any) => {
            if (Array.isArray(x)) return x;
            if (Array.isArray(x?.items)) return x.items;
            if (Array.isArray(x?.data)) return x.data;
            return [];
          };

          const stockArr = toArr(stock);
          const vehiculosArr = toArr(vehiculos);
          const facturasArr = toArr(facturas);
          const clientesArr = toArr(clientes);

          const facturasHoy = facturasArr.filter((f: any) => {
            const fecha = f?.fecha;
            const s = typeof fecha === 'string' ? fecha : (fecha?.toString?.() ?? '');
            return s.slice(0, 10) === today;
          });

          return {
            kpis: [
              { title: 'Repuestos en stock', value: String(stockArr.length), icon: 'inventory_2' },
              { title: 'Vehículos nuevos', value: String(vehiculosArr.length), icon: 'directions_car' },
              { title: 'Facturas hoy', value: String(facturasHoy.length), icon: 'receipt_long' },
              { title: 'Clientes', value: String(clientesArr.length), icon: 'badge' },
            ],
          };
        })
      )
      .subscribe({
        next: ({ kpis }) => {
          this.kpis = kpis;
          this.loading = false;
        },
        error: () => {
          this.kpis = [
            { title: 'Repuestos en stock', value: '0', icon: 'inventory_2' },
            { title: 'Vehículos nuevos', value: '0', icon: 'directions_car' },
            { title: 'Facturas hoy', value: '0', icon: 'receipt_long' },
            { title: 'Clientes', value: '0', icon: 'badge' },
          ];
          this.loading = false;
        },
      });
  }
}

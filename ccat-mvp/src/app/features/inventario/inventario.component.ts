import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InventarioRepuestosService, StockProductoResponse } from '../../core/services/inventario-repuestos';
import { ProductosService } from '../../core/services/productos';
import { FormsModule } from '@angular/forms';
import { RepuestoDialogComponent } from './repuesto-dialog/repuesto-dialog';

@Component({
  standalone: true,
  selector: 'app-inventario',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent implements OnInit {
  private hasRetried = false;
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  displayedColumns = ['codigo','nombre','categoria','stock','precio','acciones'];

  q = '';
  dataSource: Array<{ idProducto: number; codigo: string; nombre: string; categoria: string; stock: number; precio: number }> = [];

  loading = false;

  constructor(private inv: InventarioRepuestosService, private productos: ProductosService) {}

  ngOnInit(): void {
    setTimeout(() => this.cargar(), 0);
  }

  cargar(): void {
    this.loading = true;
    this.inv.listarStock(this.q).subscribe({
      next: (rows) => {
        this.dataSource = (rows ?? []).map(this.mapRow);
        this.loading = false;
      },
      error: (err) => {
        const status = err?.status ?? err?.error?.status;
        if ((status === 401 || status === 0) && !this.hasRetried) {
          this.hasRetried = true;
          setTimeout(() => this.cargar(), 350);
        }

        console.error('Inventario error:', err);
        this.dataSource = [];
        this.loading = false;
      },
    });
  }

  nuevoRepuesto() {
    const ref = this.dialog.open(RepuestoDialogComponent, { width: '760px', data: { mode: 'create' } });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) setTimeout(() => this.cargar(), 0);
    });
  }

  editarRepuesto(row: { idProducto: number }) {
    const ref = this.dialog.open(RepuestoDialogComponent, {
      width: '760px',
      data: { mode: 'edit', idProducto: row.idProducto }
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) setTimeout(() => this.cargar(), 0);
    });
  }

  eliminarRepuesto(row: { idProducto: number; nombre?: string }) {
    const nombre = row.nombre ?? 'este repuesto';
    const confirmar = window.confirm(`¿Deseas eliminar ${nombre}? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    this.productos.eliminar(row.idProducto).subscribe({
      next: (resp) => {
        this.snack.open(resp?.mensaje || 'Repuesto eliminado correctamente', 'OK', { duration: 2000 });
        this.dataSource = this.dataSource.filter(x => x.idProducto !== row.idProducto);
        setTimeout(() => this.cargar(), 0);
      },
      error: (err) => {
        const mensaje = err?.error?.detail
          || err?.error?.mensaje
          || err?.error?.title
          || 'No se pudo eliminar el repuesto. Puede estar relacionado a compras, facturas, guías u órdenes de servicio.';
        this.snack.open(mensaje, 'Cerrar', { duration: 4500 });
      }
    });
  }

  private mapRow = (r: StockProductoResponse) => {
    const idProducto = Number(r.idProducto ?? 0);
    const codigo = r.codigo ?? '';
    const nombre = r.nombre ?? r.descripcion ?? '';
    const categoria = r.categoria ?? '';
    const stock = Number(r.stock ?? 0);
    const precio = Number(r.precio ?? r.precioUnitario ?? 0);
    return { idProducto, codigo, nombre, categoria, stock, precio };
  };
}

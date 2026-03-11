import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComprasService, CompraRegistrarRequest } from '../../../core/services/contabilidad/compras';
import { ProveedoresService, ProveedorResponse } from '../../../core/services/contabilidad/proveedores';
import { InventarioRepuestosService, StockProductoResponse } from '../../../core/services/inventario-repuestos';

@Component({
  standalone: true,
  selector: 'app-compra-registrar-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './compra-registrar-dialog.html',
})
export class CompraRegistrarDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CompraRegistrarDialogComponent>);
  private compras = inject(ComprasService);
  private proveedoresApi = inject(ProveedoresService);
  private inventario = inject(InventarioRepuestosService);

  loading = false;
  errorMsg = '';

  proveedores: ProveedorResponse[] = [];
  productos: StockProductoResponse[] = [];

  form = this.fb.group({
    serie: ['C001', [Validators.required]],
    idProveedor: [null as unknown as number, [Validators.required]],
    fechaEmision: [new Date().toISOString().slice(0, 10), [Validators.required]],
    moneda: ['PEN', [Validators.required]],
    afectaStock: [true],
    usuario: ['admin', [Validators.required]],
    detalle: this.fb.array([]),
  });

  get detalle() {
    return this.form.controls.detalle as FormArray;
  }

  constructor() {
    this.proveedoresApi.listar(null, null).subscribe({
      next: (r) => (this.proveedores = r ?? []),
      error: () => (this.proveedores = []),
    });

    this.inventario.listarStock(null).subscribe({
      next: (r) => (this.productos = r ?? []),
      error: () => (this.productos = []),
    });

    this.addItem();
  }

  addItem() {
    this.detalle.push(
      this.fb.group({
        idProducto: [null as number | null],
        descripcion: ['', [Validators.required]],
        cantidad: [1, [Validators.required, Validators.min(0.0001)]],
        precioUnitario: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeItem(i: number) {
    this.detalle.removeAt(i);
    if (this.detalle.length === 0) this.addItem();
  }

  onProductoChange(i: number) {
    const row = this.detalle.at(i);
    const idProducto = row.get('idProducto')?.value as number | null;
    if (!idProducto) return;
    const p = this.productos.find((x) => x.idProducto === idProducto);
    if (!p) return;
    if (!row.get('descripcion')?.value) row.get('descripcion')?.setValue(p.nombre ?? '');
    const precio = (p.precioUnitario ?? p.precio ?? 0) as number;
    if (!row.get('precioUnitario')?.value) row.get('precioUnitario')?.setValue(precio);
  }

  get total() {
    return this.detalle.controls.reduce((acc, c) => {
      const cant = Number(c.get('cantidad')?.value ?? 0);
      const pu = Number(c.get('precioUnitario')?.value ?? 0);
      return acc + cant * pu;
    }, 0);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const req: CompraRegistrarRequest = {
      serie: v.serie!,
      idProveedor: v.idProveedor!,
      fechaEmision: v.fechaEmision!,
      moneda: v.moneda!,
      afectaStock: !!v.afectaStock,
      usuario: v.usuario!,
      detalle: (v.detalle ?? []).map((d: any) => ({
        idProducto: d.idProducto ?? null,
        descripcion: d.descripcion,
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      })),
    };

    this.loading = true;
    this.errorMsg = '';
    this.compras.registrar(req).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo registrar la compra.';
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

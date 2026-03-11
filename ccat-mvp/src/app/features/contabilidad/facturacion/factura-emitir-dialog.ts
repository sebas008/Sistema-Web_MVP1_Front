import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

import { FacturacionService, FacturaEmitirRequest } from '../../../core/services/contabilidad/facturacion';
import { ClientesService, ClienteResponse } from '../../../core/services/clientes';
import { InventarioRepuestosService, StockProductoResponse } from '../../../core/services/inventario-repuestos';
import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-factura-emitir-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  templateUrl: './factura-emitir-dialog.html',
  styles: [`
    .dialog-body{ padding-top: 4px; }
    .grid{ display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; }
    .w-220{ grid-column: span 1; min-width: 220px; }
    .w-360{ grid-column: span 2; min-width: 320px; }
    .w-120{ min-width: 120px; }
    .w-140{ min-width: 140px; }
    .detalle{ display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin: 8px 0; }
    .totales{ margin-top: 10px; font-size: 14px; }
    .error{ margin: 0 0 10px 0; padding: 8px 10px; border-radius: 10px; background: rgba(244,67,54,.08); color:#b71c1c; }
  `],
})
export class FacturaEmitirDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FacturaEmitirDialogComponent>);
  private api = inject(FacturacionService);
  private clientesApi = inject(ClientesService);
  private inventario = inject(InventarioRepuestosService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  readonly errorMsg$ = new BehaviorSubject<string>('');

  clientes: ClienteResponse[] = [];
  productos: StockProductoResponse[] = [];

  form = this.fb.group({
    serie: ['F001', [Validators.required]],
    idCliente: [null as unknown as number, [Validators.required]],
    fechaEmision: [new Date().toISOString().slice(0, 10), [Validators.required]],
    moneda: ['PEN', [Validators.required]],
    afectaStock: [true],
    usuario: [this.auth.getUsuario() ?? 'admin', [Validators.required]],
    detalle: this.fb.array([]),
  });

  get detalle() {
    return this.form.controls.detalle as FormArray;
  }

  constructor() {
    this.clientesApi.listar(null, true).subscribe({
      next: (r) => {
        this.clientes = r ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.clientes = [];
        this.cdr.markForCheck();
      },
    });

    this.inventario.listarStock(null).subscribe({
      next: (r) => {
        this.productos = r ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.productos = [];
        this.cdr.markForCheck();
      },
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
    const req: FacturaEmitirRequest = {
      serie: v.serie!,
      idCliente: v.idCliente!,
      fechaEmision: v.fechaEmision!,
      moneda: v.moneda!,
      afectaStock: !!v.afectaStock,
      usuario: v.usuario!,
      detalle: (v.detalle ?? []).map((d: any, index: number) => ({
        item: index + 1,
        tipo: 'PRODUCTO',
        idProducto: d.idProducto ?? null,
        descripcion: d.descripcion,
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      } as any)),
    };

    this.loading = true;
    this.errorMsg$.next('');
    this.cdr.markForCheck();
    this.api.emitir(req).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        // Evita NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
        setTimeout(() => {
          this.errorMsg$.next(err?.error?.detail ?? err?.error?.message ?? 'No se pudo emitir la factura.');
          this.cdr.markForCheck();
        }, 0);
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

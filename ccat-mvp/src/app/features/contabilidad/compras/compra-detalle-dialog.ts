import { CommonModule } from '@angular/common';
import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { ComprasService, CompraResponse } from '../../../core/services/contabilidad/compras';

@Component({
  standalone: true,
  selector: 'app-compra-detalle-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './compra-detalle-dialog.html',
  styleUrl: './compra-detalle-dialog.scss',
})
export class CompraDetalleDialogComponent {
  loading = true;
  errorMsg = '';
  compra: CompraResponse | any | null = null;

  constructor(
    private api: ComprasService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<CompraDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idCompra: number }
  ) {}

  ngOnInit() {
    this.loading = true;
    this.errorMsg = '';
    this.compra = null;

    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMsg = 'No se pudo cargar el detalle (tiempo de espera).';
        this.cdr.detectChanges();
      }
    }, 6000);

    this.api
      .obtener(this.data.idCompra)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.compra = this.normalize(res);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMsg = this.pickError(err);
          this.cdr.detectChanges();
        },
      });
  }

  cerrar() {
    this.dialogRef.close();
  }

  private normalize(res: any): any {
    if (Array.isArray(res)) {
      if (res.length === 0) return { detalle: [] };
      const h = res[0] ?? {};
      return {
        idCompra: h.idCompra ?? this.data.idCompra,
        numero: h.numero ?? '',
        fecha: h.fecha ?? null,
        proveedor: h.proveedor ?? null,
        total: h.total ?? 0,
        estado: h.estado ?? '',
        detalle: res.map((x: any, idx: number) => ({
          item: x.item ?? (idx + 1),
          descripcion: x.descripcion ?? '',
          cantidad: Number(x.cantidad ?? 0),
          precioUnitario: Number(x.precioUnitario ?? 0),
          importe: 'importe' in x ? Number(x.importe ?? 0) : Number(((x.cantidad ?? 0) * (x.precioUnitario ?? 0)).toFixed(2)),
        })),
      };
    }

    if (res && typeof res === 'object') {
      if (Array.isArray(res.detalle)) return res;

      const hasDetail =
        'descripcion' in res || 'cantidad' in res || 'precioUnitario' in res || 'importe' in res;

      return {
        idCompra: res.idCompra ?? this.data.idCompra,
        numero: res.numero ?? '',
        fecha: res.fecha ?? null,
        proveedor: res.proveedor ?? null,
        total: res.total ?? 0,
        estado: res.estado ?? '',
        detalle: hasDetail
          ? [
              {
                item: res.item ?? 1,
                descripcion: res.descripcion ?? '',
                cantidad: Number(res.cantidad ?? 0),
                precioUnitario: Number(res.precioUnitario ?? 0),
                importe: 'importe' in res
                  ? Number(res.importe ?? 0)
                  : Number(((res.cantidad ?? 0) * (res.precioUnitario ?? 0)).toFixed(2)),
              },
            ]
          : [],
      };
    }

    return { detalle: [] };
  }

  private pickError(err: any): string {
    const e = err?.error;
    if (typeof e === 'string') return e;
    if (e?.detail) return String(e.detail);
    if (e?.error) return String(e.error);
    if (e?.message) return String(e.message);
    if (err?.message) return String(err.message);
    return 'No se pudo cargar la compra.';
  }
}

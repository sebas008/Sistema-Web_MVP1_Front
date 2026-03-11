import { CommonModule } from '@angular/common';
import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { FacturacionService } from '../../../core/services/contabilidad/facturacion';

type FacturaDetalleItem = {
  item: number;
  tipoItem: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
};

type FacturaDetalleVM = {
  idFactura: number;
  numero: string;
  fecha: string;
  estado: string;
  total: number;
  detalle: FacturaDetalleItem[];
};

@Component({
  selector: 'app-factura-detalle-dialog',
  templateUrl: './factura-detalle-dialog.html',
  styleUrls: ['./factura-detalle-dialog.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class FacturaDetalleDialogComponent {
  loading = true;
  error: string | null = null;
  vm: FacturaDetalleVM | null = null;

  constructor(
    private api: FacturacionService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<FacturaDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idFactura: number }
  ) {}

  ngOnInit() {
    this.loading = true;
    this.error = null;
    this.vm = null;

    // Safety: if something breaks outside Angular zone, do not leave the user stuck forever
    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'No se pudo cargar el detalle (tiempo de espera).';
        this.cdr.detectChanges();
      }
    }, 6000);

    this.api
      .obtener(this.data.idFactura)
      .pipe(
        finalize(() => {
          this.loading = false;
          // Force UI update even if zone/CD got interrupted
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          try {
            this.vm = this.normalize(res);
          } catch (e) {
            this.error = 'Respuesta inválida del servidor para el detalle de la factura.';
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = this.pickError(err);
          this.cdr.detectChanges();
        },
      });
  }

  cerrar() {
    this.dialogRef.close();
  }

  private normalize(res: any): FacturaDetalleVM {
    if (res && typeof res === 'object' && Array.isArray(res.detalle)) {
      return {
        idFactura: Number(res.idFactura ?? this.data.idFactura),
        numero: String(res.numero ?? ''),
        fecha: String(res.fecha ?? ''),
        estado: String(res.estado ?? ''),
        total: Number(res.total ?? 0),
        detalle: res.detalle.map((x: any) => this.mapItem(x)),
      };
    }

    if (Array.isArray(res)) {
      const h = res[0] ?? {};
      return {
        idFactura: Number(h.idFactura ?? this.data.idFactura),
        numero: String(h.numero ?? ''),
        fecha: String(h.fecha ?? ''),
        estado: String(h.estado ?? ''),
        total: Number(h.total ?? 0),
        detalle: res.map((x: any) => this.mapItem(x)),
      };
    }

    if (res && typeof res === 'object') {
      const hasDetailCols =
        'descripcion' in res || 'cantidad' in res || 'precioUnitario' in res || 'importe' in res || 'tipoItem' in res;

      return {
        idFactura: Number(res.idFactura ?? this.data.idFactura),
        numero: String(res.numero ?? ''),
        fecha: String(res.fecha ?? ''),
        estado: String(res.estado ?? ''),
        total: Number(res.total ?? 0),
        detalle: hasDetailCols ? [this.mapItem(res)] : [],
      };
    }

    return { idFactura: this.data.idFactura, numero: '', fecha: '', estado: '', total: 0, detalle: [] };
  }

  private mapItem(x: any): FacturaDetalleItem {
    const cantidad = Number(x.cantidad ?? 0);
    const precioUnitario = Number(x.precioUnitario ?? 0);
    const importe = 'importe' in x ? Number(x.importe ?? 0) : Number((cantidad * precioUnitario).toFixed(2));
    return {
      item: Number(x.item ?? 1),
      tipoItem: String(x.tipoItem ?? ''),
      descripcion: String(x.descripcion ?? ''),
      cantidad,
      precioUnitario,
      importe,
    };
  }

  private pickError(err: any): string {
    const e = err?.error;
    if (typeof e === 'string') return e;
    if (e?.detail) return String(e.detail);
    if (e?.error) return String(e.error);
    if (err?.message) return String(err.message);
    return 'No se pudo cargar el detalle de la factura.';
  }
}
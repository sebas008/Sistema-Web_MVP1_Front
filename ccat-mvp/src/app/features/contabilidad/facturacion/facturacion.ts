import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FacturacionService, FacturaResponse } from '../../../core/services/contabilidad/facturacion';
import { FacturaEmitirDialogComponent } from './factura-emitir-dialog';
import { FacturaDetalleDialogComponent } from './factura-detalle-dialog';

@Component({
  standalone: true,
  selector: 'app-facturacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './facturacion.html',
  styleUrls: ['./facturacion.scss']
})
export class FacturacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(FacturacionService);
  private dialog = inject(MatDialog);

  loading = false;
  errorMsg = '';
  displayedColumns = ['numero', 'cliente', 'fecha', 'total', 'estado', 'acciones'];
  dataSource: FacturaResponse[] = [];
  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMsg = '';
    const q = this.form.value.q?.trim() || null;

    this.api.listar(q)
      .pipe(
        timeout(8000),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (rows) => {
          this.dataSource = rows ?? [];
        },
        error: (err: any) => {
          this.errorMsg = err?.name === 'TimeoutError'
            ? 'La consulta tardó demasiado. Intenta actualizar otra vez.'
            : (err?.error?.detail ?? err?.error?.message ?? 'No se pudo cargar facturación.');
        }
      });
  }

  limpiar(): void {
    this.form.patchValue({ q: '' });
    this.cargar();
  }

  emitir(): void {
    const ref = this.dialog.open(FacturaEmitirDialogComponent, { width: '920px' });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar();
    });
  }

  anular(row: FacturaResponse): void {
    const estado = (row.estado || '').toUpperCase();
    if (estado === 'ANULADA') return;
    if (!confirm('¿Anular la factura?')) return;

    this.api.anular(row.idFactura).subscribe({
      next: () => this.cargar(),
      error: (err: any) => {
        this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo anular.';
      }
    });
  }

  ver(row: FacturaResponse): void {
    this.dialog.open(FacturaDetalleDialogComponent, {
      width: '980px',
      maxWidth: '95vw',
      data: { idFactura: row.idFactura }
    });
  }

  get totalEmitidas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'EMITIDA').length;
  }

  get totalAnuladas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'ANULADA').length;
  }

  get sumaTotal(): number {
    return this.dataSource.reduce((acc, x) => acc + (x.total || 0), 0);
  }
}

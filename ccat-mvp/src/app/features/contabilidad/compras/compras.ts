import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, timeout } from 'rxjs/operators';

import { ComprasService, CompraResponse } from '../../../core/services/contabilidad/compras';
import { CompraRegistrarDialogComponent } from './compra-registrar-dialog';
import { CompraDetalleDialogComponent } from './compra-detalle-dialog';

@Component({
  standalone: true,
  selector: 'app-compras',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './compras.html',
  styleUrls: ['./compras.scss'],
})
export class ComprasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ComprasService);
  private dialog = inject(MatDialog);

  loading = false;
  errorMsg = '';
  private initialRetryDone = false;

  displayedColumns = ['numero', 'proveedor', 'fecha', 'total', 'estado', 'acciones'];
  dataSource: CompraResponse[] = [];

  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    setTimeout(() => this.cargar(true), 0);
  }

  cargar(fromInit = false): void {
    this.loading = true;
    this.errorMsg = '';
    const q = this.form.value.q?.trim() || null;

    this.api.listar(q)
      .pipe(
        timeout(8000),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (rows: CompraResponse[]) => {
          this.dataSource = rows ?? [];
          if (fromInit && !this.initialRetryDone && this.dataSource.length === 0) {
            this.initialRetryDone = true;
            setTimeout(() => this.cargar(false), 500);
          }
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo cargar compras.';
        }
      });
  }

  limpiar(): void {
    this.form.patchValue({ q: '' });
    this.cargar(false);
  }

  registrar(): void {
    const ref = this.dialog.open(CompraRegistrarDialogComponent, {
      width: '980px',
      maxWidth: '96vw',
      panelClass: 'ccat-dialog'
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(false);
    });
  }

  anular(row: CompraResponse): void {
    const estado = (row.estado || '').toUpperCase();
    if (estado === 'ANULADA') return;
    const ok = confirm(`¿Anular la compra ${row.numero}?`);
    if (!ok) return;

    this.loading = true;
    this.errorMsg = '';
    this.api.anular(row.idCompra)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: () => this.cargar(false),
        error: (err) => {
          this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo anular la compra.';
        }
      });
  }

  ver(row: CompraResponse): void {
    this.dialog.open(CompraDetalleDialogComponent, {
      width: '980px',
      maxWidth: '96vw',
      panelClass: 'ccat-dialog',
      data: { idCompra: row.idCompra }
    });
  }

  get totalRegistradas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'REGISTRADA').length;
  }

  get totalAnuladas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'ANULADA').length;
  }

  get sumaTotal(): number {
    return this.dataSource.reduce((acc, x) => acc + Number(x.total || 0), 0);
  }
}

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
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

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
export class FacturacionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(FacturacionService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = false;
  errorMsg = '';
  displayedColumns = ['numero', 'cliente', 'fecha', 'total', 'estado', 'acciones'];
  dataSource: FacturaResponse[] = [];
  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.cargar(true);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.startsWith('/app/contabilidad/facturacion')) {
          this.cargar(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(force = false): void {
    if (this.loading && !force) return;

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
    this.cargar(true);
  }

  emitir(): void {
    const ref = this.dialog.open(FacturaEmitirDialogComponent, { width: '920px' });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }

  anular(row: FacturaResponse): void {
    const estado = (row.estado || '').toUpperCase();
    if (estado === 'ANULADA') return;
    if (!confirm('¿Anular la factura?')) return;

    this.api.anular(row.idFactura).subscribe({
      next: () => this.cargar(true),
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
    return this.dataSource.reduce((acc, x) => acc + Number(x.total || 0), 0);
  }

  statusClass(estado: string): 'ok' | 'bad' | 'mid' | 'draft' {
    const e = (estado || '').toUpperCase();

    if (e === 'EMITIDA' || e === 'REGISTRADA' || e === 'ACTIVO') return 'ok';
    if (e === 'ANULADA' || e === 'INACTIVO' || e === 'RECHAZADA') return 'bad';
    if (e === 'PENDIENTE') return 'mid';
    return 'draft';
  }
}

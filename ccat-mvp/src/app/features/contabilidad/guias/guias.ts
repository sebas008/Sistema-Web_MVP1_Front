import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { GuiasService, GuiaResponse } from '../../../core/services/contabilidad/guias';
import { GuiaEmitirDialogComponent } from './guia-emitir-dialog';
import { GuiaDetalleDialogComponent } from './guia-detalle-dialog';

@Component({
  standalone: true,
  selector: 'app-guias',
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
  templateUrl: './guias.html',
  styleUrls: ['./guias.scss'],
})
export class GuiasComponent implements OnInit, OnDestroy {
  private hasRetried = false;
  private fb = inject(FormBuilder);
  private api = inject(GuiasService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = false;
  errorMsg = '';

  displayedColumns = ['numero', 'tipo', 'fecha', 'estado', 'acciones'];
  dataSource: GuiaResponse[] = [];

  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    setTimeout(() => this.cargar(true), 0);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.startsWith('/app/contabilidad/guias')) {
          this.cargar(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(esInicial = false) {
    if (this.loading && !esInicial) return;

    this.loading = true;
    this.errorMsg = '';

    const q = this.form.value.q?.trim() || null;

    this.api.listar(q).pipe(
      timeout(10000),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (rows: GuiaResponse[]) => {
        this.dataSource = rows ?? [];

        if (esInicial && !this.hasRetried && this.dataSource.length === 0) {
          this.hasRetried = true;
          setTimeout(() => this.cargar(false), 400);
        }
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.detail ?? err?.error?.message ?? err?.message ?? 'No se pudo cargar guías.';
      }
    });
  }

  limpiar() {
    this.form.patchValue({ q: '' });
    this.cargar(true);
  }

  emitir() {
    const ref = this.dialog.open(GuiaEmitirDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '88vh'
    });

    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }

  ver(row: GuiaResponse) {
    this.dialog.open(GuiaDetalleDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '88vh',
      data: { idGuia: row.idGuia }
    });
  }

  anular(row: GuiaResponse) {
    const estado = (row.estado || '').toUpperCase();
    if (estado === 'ANULADA') return;

    const ok = confirm(`¿Deseas anular la guía "${row.numero}"?`);
    if (!ok) return;

    this.api.anular(row.idGuia).subscribe({
      next: () => this.cargar(true),
      error: (err: any) => {
        this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo anular la guía.';
      }
    });
  }

  get emitidas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'EMITIDA').length;
  }

  get anuladas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'ANULADA').length;
  }

  chipClass(estado: string): 'ok' | 'bad' | 'mid' {
    const e = (estado || '').toUpperCase();
    if (e === 'ANULADA') return 'bad';
    if (e === 'PENDIENTE') return 'mid';
    return 'ok';
  }
}

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { filter, finalize, takeUntil, timeout } from 'rxjs/operators';

import { OrdenesServicioService, OrdenServicio } from '../../../core/services/ordenes-servicio';
import { OsCrearDialogComponent } from './os-crear-dialog/os-crear-dialog';

@Component({
  standalone: true,
  selector: 'app-ordenes-servicio',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './ordenes-servicio.html',
  styleUrls: ['./ordenes-servicio.scss'],
})
export class OrdenesServicioComponent implements OnInit, OnDestroy {
  private readonly svc = inject(OrdenesServicioService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  loading = false;

  displayedColumns = ['numero', 'vehiculo', 'estado', 'total', 'acciones'];
  data: OrdenServicio[] = [];

  filtro = this.fb.group({
    q: [''],
    estado: [''],
  });

  ngOnInit(): void {
    this.cargar(true);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url === '/app/servicios-mecanicos' || url === '/app/servicios') {
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

    const { q, estado } = this.filtro.value;

    this.loading = true;
    this.svc.listar(q ?? null, estado ?? null)
      .pipe(
        timeout(8000),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (res) => {
          this.data = res ?? [];
        },
        error: () => {
          this.snack.open('Error cargando órdenes de servicio', 'Cerrar', { duration: 2500 });
        },
      });
  }

  limpiar(): void {
    this.filtro.reset({ q: '', estado: '' });
    this.cargar(true);
  }

  abrirDetalle(row: OrdenServicio): void {
    this.router.navigate(['/app/servicios-mecanicos', row.idOrdenServicio]);
  }

  abrirCrear(): void {
    const ref = this.dialog.open(OsCrearDialogComponent, { width: '760px' });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }
}

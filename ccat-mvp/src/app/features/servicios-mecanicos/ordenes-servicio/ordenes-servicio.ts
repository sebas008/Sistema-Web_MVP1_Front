import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
export class OrdenesServicioComponent implements OnInit {
  private readonly svc = inject(OrdenesServicioService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  loading = false;

  displayedColumns = ['numero', 'vehiculo', 'estado', 'total', 'acciones'];
  data: OrdenServicio[] = [];

  filtro = this.fb.group({
    q: [''],
    estado: [''],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const { q, estado } = this.filtro.value;

    this.loading = true;
    this.svc.listar(q ?? null, estado ?? null).subscribe({
      next: (res) => {
        this.data = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error cargando órdenes de servicio', 'Cerrar', { duration: 2500 });
      },
    });
  }

  limpiar(): void {
    this.filtro.reset({ q: '', estado: '' });
    this.cargar();
  }

  //  Para que tu HTML no falle:
  abrirDetalle(row: OrdenServicio): void {
    this.router.navigate(['/app/servicios-mecanicos', row.idOrdenServicio]);
  }

  //  Para que tu HTML no falle:
  abrirCrear(): void {
    const ref = this.dialog.open(OsCrearDialogComponent, { width: '760px' });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar();
    });
  }
}
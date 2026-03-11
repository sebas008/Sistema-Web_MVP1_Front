import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { OrdenesServicioService, OrdenServicio } from '../../../core/services/ordenes-servicio';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-orden-servicio-detalle',
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
  ],
  templateUrl: './orden-servicio-detalle.html',
  styleUrls: ['./orden-servicio-detalle.scss']
})
export class OrdenServicioDetalleComponent implements OnInit {
  private readonly svc = inject(OrdenesServicioService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  loading = false;
  id = 0;
  os?: OrdenServicio;

  displayedColumns = ['item', 'tipo', 'descripcion', 'cantidad', 'precio', 'importe', 'acciones'];

  form = this.fb.group({
    tipo: ['SERVICIO', [Validators.required]],
    idProducto: [null as number | null],
    descripcion: ['', [Validators.required]],
    cantidad: [1, [Validators.required]],
    precioUnitario: [0, [Validators.required]],
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.svc.obtener(this.id).subscribe({
      next: (res) => { this.os = res; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('No se pudo cargar la OS', 'Cerrar', { duration: 2500 }); }
    });
  }

  cambiarEstado(estado: string): void {
    this.svc.cambiarEstado(this.id, estado).subscribe({
      next: (res) => { this.os = res; this.snack.open('Estado actualizado', 'OK', { duration: 1500 }); },
      error: () => this.snack.open('No se pudo cambiar estado', 'Cerrar', { duration: 2500 })
    });
  }

  agregar(): void {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.value,
      usuario: 'admin'
    } as any;

    this.svc.agregarDetalle(this.id, payload).subscribe({
      next: (res) => {
        this.os = res;
        this.form.reset({ tipo: 'SERVICIO', idProducto: null, descripcion: '', cantidad: 1, precioUnitario: 0 });
        this.snack.open('Ítem agregado', 'OK', { duration: 1500 });
      },
      error: () => this.snack.open('No se pudo agregar ítem', 'Cerrar', { duration: 2500 })
    });
  }

  eliminar(idDetalle: number): void {
    this.svc.removerDetalle(idDetalle, 'admin').subscribe({
      next: () => { this.cargar(); this.snack.open('Ítem eliminado', 'OK', { duration: 1500 }); },
      error: () => this.snack.open('No se pudo eliminar', 'Cerrar', { duration: 2500 })
    });
  }
}
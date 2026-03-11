import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { VehiculosNuevosService, VehiculoNuevoCrearRequest, VehiculoNuevoActualizarRequest } from '../../core/services/vehiculos-nuevos';

type VehiculoRow = {
  idVehiculo: number;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  precioLista: number;
  activo: boolean;
};

@Component({
  standalone: true,
  selector: 'app-vehiculo-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './vehiculo-dialog.html',
})
export class VehiculoDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(VehiculosNuevosService);
  private dialogRef = inject(MatDialogRef<VehiculoDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as VehiculoRow | null;

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    vin: [''],
    marca: ['', [Validators.required]],
    modelo: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.min(1900)]],
    color: [''],
    precioLista: [0, [Validators.required, Validators.min(0)]],
    activo: [true],
    usuario: ['admin', [Validators.required]],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        vin: this.data.vin,
        marca: this.data.marca,
        modelo: this.data.modelo,
        anio: this.data.anio,
        color: this.data.color,
        precioLista: this.data.precioLista,
        activo: this.data.activo,
      });
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const v = this.form.getRawValue();
    const payloadBase = {
      vin: v.vin || null,
      marca: v.marca!,
      modelo: v.modelo!,
      anio: v.anio ? Number(v.anio) : null,
      color: v.color || null,
      precioLista: Number(v.precioLista ?? 0),
      activo: !!v.activo,
      usuario: v.usuario!,
    };

    const obs = this.data?.idVehiculo
      ? this.api.actualizar(this.data.idVehiculo, payloadBase as VehiculoNuevoActualizarRequest)
      : this.api.crear(payloadBase as VehiculoNuevoCrearRequest);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo guardar el vehículo.';
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

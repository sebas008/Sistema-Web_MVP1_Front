import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrdenesServicioService } from '../../../../core/services/ordenes-servicio';
import { ClientesService, ClienteResponse } from '../../../../core/services/clientes';

@Component({
  standalone: true,
  selector: 'app-os-crear-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './os-crear-dialog.html',
})
export class OsCrearDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<OsCrearDialogComponent>);
  private osApi = inject(OrdenesServicioService);
  private clientesApi = inject(ClientesService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  readonly errorMsg$ = new BehaviorSubject<string>('');

  clientes: ClienteResponse[] = [];

  form = this.fb.group({
    idCliente: [null as number | null, [Validators.required]],
    placa: [''],
    marca: [''],
    modelo: [''],
    kilometraje: [null as number | null],
    observacion: [''],
    usuario: ['admin', [Validators.required]],
  });

  constructor() {
    this.clientesApi.listar(null, true).subscribe({
      next: (c) => {
        this.clientes = c ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.clientes = [];
        this.cdr.markForCheck();
      },
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.loading = true;
    this.errorMsg$.next('');
    this.cdr.markForCheck();

    this.osApi
      .crear({
        idCliente: v.idCliente!,
        placa: v.placa || null,
        marca: v.marca || null,
        modelo: v.modelo || null,
        kilometraje: v.kilometraje ?? null,
        observacion: v.observacion || null,
        usuario: v.usuario!,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck();
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
        // Evita NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
        setTimeout(() => {
          this.errorMsg$.next(err?.error?.message ?? 'No se pudo crear la orden de servicio.');
          this.cdr.markForCheck();
        }, 0);
        },
      });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

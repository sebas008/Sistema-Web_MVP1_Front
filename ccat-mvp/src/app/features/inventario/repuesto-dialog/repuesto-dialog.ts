import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { ProductosService } from '../../../core/services/productos';
import { InventarioRepuestosService } from '../../../core/services/inventario-repuestos';
import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-repuesto-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './repuesto-dialog.html',
})
export class RepuestoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RepuestoDialogComponent>);
  private productos = inject(ProductosService);
  private inventario = inject(InventarioRepuestosService);
  private auth = inject(AuthService);

  loading = false;
  errorMsg = '';

  mode: 'create' | 'edit' = 'create';
  idProducto?: number;

  form = this.fb.group({
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    categoria: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stockInicial: [0, [Validators.min(0)]],
    usuario: [this.auth.getUsuario() ?? 'admin', [Validators.required]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.mode = (data?.mode ?? 'create') as any;
    this.idProducto = data?.idProducto;

    if (this.mode === 'edit' && this.idProducto) {
      this.loading = true;
      this.productos.obtener(this.idProducto).subscribe({
        next: (p) => {
          setTimeout(() => {
  this.form.patchValue({
              codigo: p.codigo ?? '',
              nombre: p.nombre ?? '',
              categoria: p.descripcion ?? '',
              precio: Number(p.precio ?? 0),
              stockInicial: 0,
            });
            // stockInicial no aplica en edición
            this.form.controls.stockInicial.disable();
            this.loading = false;
}, 0);
        },
        error: () => {
          setTimeout(() => {
  this.loading = false;
            this.errorMsg = 'No se pudo cargar el repuesto.';
}, 0);
        }
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

    const payload = {
      codigo: v.codigo!,
      nombre: v.nombre!,
      descripcion: v.categoria || null,
      precio: Number(v.precio ?? 0),
    };

    const request$ = this.mode === 'edit' && this.idProducto
      ? this.productos.actualizar(this.idProducto, payload)
      : this.productos.crear(payload);

    request$.subscribe({
      next: (p: any) => {
        // Solo en creación aplicamos stock inicial.
                if (this.mode === 'create') {
                  const stockIni = Number(v.stockInicial ?? 0);
                  if (stockIni > 0) {
                    this.inventario
                      .aplicarMovimiento({
                        idProducto: p.productoId,
                        cantidad: stockIni,
                        tipoMovimiento: 'ENTRADA',
                        referencia: 'INIT',
                        usuario: v.usuario!,
                      })
                      .subscribe({
                        next: () => {
                          this.loading = false;
                          this.dialogRef.close(true);
                        },
                        error: () => {
                          this.loading = false;
                          this.dialogRef.close(true);
                        },
                      });
                    return;
                  }
                }
        
                this.loading = false;
                this.dialogRef.close(true);
      },
      error: (err) => {
        setTimeout(() => {
          this.loading = false;
                  this.errorMsg = err?.error?.message ?? (this.mode === 'edit' ? 'No se pudo actualizar el repuesto.' : 'No se pudo crear el repuesto.');
        }, 0);
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

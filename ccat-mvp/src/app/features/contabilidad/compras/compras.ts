import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComprasService, CompraResponse } from '../../../core/services/contabilidad/compras';

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
  ],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss'],
})
export class ComprasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ComprasService);

  loading = false;
  errorMsg = '';

  displayedColumns = ['numero', 'proveedor', 'fecha', 'total', 'estado', 'acciones'];
  dataSource: CompraResponse[] = [];

  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.errorMsg = '';

    const q = this.form.value.q?.trim() || null;

    this.api.listar(q).subscribe({
      next: (rows: CompraResponse[]) => {
        this.dataSource = rows ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo cargar compras.';
      }
    });
  }

  limpiar() {
    this.form.patchValue({ q: '' });
    this.cargar();
  }

  registrarDemo() {
    // MVP: proveedor fijo para demo
    this.loading = true;
    this.errorMsg = '';

    this.api.registrar({ idProveedor: 1, usuario: 'admin' }).subscribe({
      next: (_: CompraResponse) => this.cargar(),
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo registrar la compra.';
      }
    });
  }

  ver(row: CompraResponse) {
    alert(`Compra: ${row.numero}\nEstado: ${row.estado}\nTotal: S/ ${row.total}`);
  }

  anular(row: CompraResponse) {
    alert(`MVP: Anular ${row.numero} (endpoint pendiente)`);
  }

  get totalRegistradas() {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'REGISTRADA').length;
  }

  get totalAnuladas() {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'ANULADA').length;
  }

  get sumaTotal() {
    return this.dataSource.reduce((acc, x) => acc + (x.total || 0), 0);
  }
}
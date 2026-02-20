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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FacturacionService, FacturaResponse } from '../../../core/services/contabilidad/facturacion';
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.scss']
})
export class FacturacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(FacturacionService);
  private dialog = inject(MatDialog);

  loading = false;
  errorMsg = '';

  displayedColumns = ['numero', 'cliente', 'fecha', 'total', 'estado', 'acciones'];
  dataSource: FacturaResponse[] = [];

  form = this.fb.group({
    q: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.errorMsg = '';

    const q = this.form.value.q?.trim() || null;

    this.api.listar(q).subscribe({
      next: (rows) => {
        this.dataSource = rows ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo cargar facturación.';
      }
    });
  }

  limpiar() {
    this.form.patchValue({ q: '' });
    this.cargar();
  }

  emitirDemo() {
    // MVP: emitir con cliente fijo para demo (luego haces modal con IdCliente real)
    this.loading = true;
    this.errorMsg = '';

    this.api.emitir({ idCliente: 1, usuario: 'admin' }).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo emitir la factura.';
      }
    });
  }

  ver(row: FacturaResponse) {
    // MVP simple: alert. Si quieres, lo cambiamos por modal con detalle.
    alert(`Factura: ${row.numero}\nEstado: ${row.estado}\nTotal: S/ ${row.total}`);
  }

  anular(row: FacturaResponse) {
    // Si tu API tiene endpoint para anular, lo conectamos luego.
    alert(`MVP: Anular ${row.numero} (endpoint pendiente)`);
  }

  // KPIs
  get totalEmitidas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'EMITIDA').length;
  }

  get totalAnuladas(): number {
    return this.dataSource.filter(x => (x.estado || '').toUpperCase() === 'ANULADA').length;
  }

  get sumaTotal(): number {
    return this.dataSource.reduce((acc, x) => acc + (x.total || 0), 0);
  }
}
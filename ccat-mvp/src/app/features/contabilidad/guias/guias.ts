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

import { GuiasService, GuiaResponse } from '../../../core/services/contabilidad/guias';

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
  ],
  templateUrl: './guias.html',
  styleUrls: ['./guias.scss'],
})
export class GuiasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(GuiasService);

  loading = false;
  errorMsg = '';

  displayedColumns = ['numero', 'cliente', 'fecha', 'estado', 'referencia', 'acciones'];
  dataSource: GuiaResponse[] = [];

  form = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.errorMsg = '';

    const q = this.form.value.q?.trim() || null;

    this.api.listar(q).subscribe({
      next: (rows: GuiaResponse[]) => {
        this.dataSource = rows ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo cargar guías.';
      }
    });
  }

  limpiar() {
    this.form.patchValue({ q: '' });
    this.cargar();
  }

  emitirDemo() {
    // MVP: cliente fijo para demo
    this.loading = true;
    this.errorMsg = '';

    this.api.emitir({ idCliente: 1, usuario: 'admin' }).subscribe({
      next: (_: GuiaResponse) => this.cargar(),
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'No se pudo emitir la guía.';
      }
    });
  }

  ver(row: GuiaResponse) {
    alert(`Guía: ${row.numero}\nEstado: ${row.estado}\nCliente: ${row.cliente || '-'}`);
  }

  anular(row: GuiaResponse) {
    // Si agregas endpoint para anular, lo conectamos
    alert(`MVP: Anular ${row.numero} (endpoint pendiente)`);
  }

  // KPIs
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
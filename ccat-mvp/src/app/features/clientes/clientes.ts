import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService, ClienteResponse } from '../../core/services/clientes';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'app-clientes',
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  private readonly svc = inject(ClientesService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  loading = false;

  filtroForm = this.fb.group({
    q: [''],
    soloActivos: [true]
  });

  data: ClienteResponse[] = [];
  displayedColumns = ['razonSocial', 'documento', 'contacto', 'activo', 'acciones'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const { q, soloActivos } = this.filtroForm.value;

    this.loading = true;
    this.svc.listar(q ?? null, soloActivos ?? null).subscribe({
      next: (res) => {
        this.data = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Error cargando clientes', 'Cerrar', { duration: 2500 });
      }
    });
  }

  limpiar(): void {
    this.filtroForm.reset({ q: '', soloActivos: true });
    this.cargar();
  }

  abrirCrear(): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      width: '720px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.cargar();
    });
  }

  abrirEditar(row: ClienteResponse): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      width: '720px',
      data: { mode: 'edit', cliente: row }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.cargar();
    });
  }

  toggleActivo(row: ClienteResponse): void {
    const nuevo = !row.activo;
    this.svc.cambiarEstado(row.idCliente, nuevo).subscribe({
      next: () => {
        row.activo = nuevo;
        this.snack.open('Estado actualizado', 'OK', { duration: 1500 });
      },
      error: () => this.snack.open('No se pudo cambiar estado', 'Cerrar', { duration: 2500 })
    });
  }
}

/* ===========================
   Dialog Crear/Editar
   =========================== */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  template: `
  <div class="dialog-wrap">
    <div class="dialog-header">
      <div class="title">
        <mat-icon>person</mat-icon>
        <div>
          <h2>{{ mode === 'create' ? 'Nuevo cliente' : 'Editar cliente' }}</h2>
          <p class="sub">Datos básicos para facturación y guías</p>
        </div>
      </div>

      <button mat-icon-button (click)="close(false)">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <form [formGroup]="form" class="grid">
      <mat-form-field appearance="outline">
        <mat-label>Tipo documento</mat-label>
        <mat-select formControlName="tipoDocumento">
          <mat-option [value]="null">—</mat-option>
          <mat-option value="DNI">DNI</mat-option>
          <mat-option value="RUC">RUC</mat-option>
          <mat-option value="CE">CE</mat-option>
          <mat-option value="PAS">PAS</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>N° documento</mat-label>
        <input matInput formControlName="numeroDocumento" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="span-2">
        <mat-label>Razón social / Nombres</mat-label>
        <input matInput formControlName="razonSocial" />
        <mat-error *ngIf="form.controls.razonSocial.invalid">Obligatorio</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="span-2">
        <mat-label>Dirección</mat-label>
        <input matInput formControlName="direccion" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="telefono" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>
    </form>

    <div class="actions">
      <button mat-button (click)="close(false)">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="save()">
        {{ mode === 'create' ? 'Crear' : 'Guardar' }}
      </button>
    </div>
  </div>
  `,
  styles: [`
    .dialog-wrap{ padding: 16px; }
    .dialog-header{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .title{ display:flex; gap:12px; align-items:flex-start; }
    .title h2{ margin:0; font-size:18px; }
    .sub{ margin:2px 0 0 0; opacity:.75; font-size:12px; }
    .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px; }
    .span-2{ grid-column: span 2; }
    .actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px; }
  `]
})
export class ClienteDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ClientesService);

  loading = false;
  mode: 'create' | 'edit';
  clienteId?: number;

  form = this.fb.group({
    tipoDocumento: [null as string | null],
    numeroDocumento: [''],
    razonSocial: ['', [Validators.required]],
    direccion: [''],
    telefono: [''],
    email: [''],
  });

  constructor(
    private ref: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode;
    if (this.mode === 'edit' && data.cliente) {
      const c = data.cliente as ClienteResponse;
      this.clienteId = c.idCliente;
      this.form.patchValue({
        tipoDocumento: c.tipoDocumento ?? null,
        numeroDocumento: c.numeroDocumento ?? '',
        razonSocial: c.razonSocial ?? '',
        direccion: c.direccion ?? '',
        telefono: c.telefono ?? '',
        email: c.email ?? '',
      });
    }
  }

  close(ok: boolean): void {
    this.ref.close(ok);
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const payload = {
      ...this.form.value,
      usuario: 'admin'
    };

    const req$ = this.mode === 'create'
      ? this.svc.crear(payload as any)
      : this.svc.actualizar(this.clienteId!, payload as any);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.close(true);
      },
      error: () => {
        this.loading = false;
        this.close(false);
      }
    });
  }
}
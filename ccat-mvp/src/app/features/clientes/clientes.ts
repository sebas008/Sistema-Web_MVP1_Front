import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService, ClienteResponse, ClienteCrearRequest, ClienteActualizarRequest } from '../../core/services/clientes';

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
import { Subject } from 'rxjs';
import { filter, finalize, takeUntil, timeout } from 'rxjs/operators';

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
export class ClientesComponent implements OnInit, OnDestroy {
  private readonly svc = inject(ClientesService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  loading = false;

  filtroForm = this.fb.group({
    q: [''],
    soloActivos: [true]
  });

  data: ClienteResponse[] = [];
  displayedColumns = ['razonSocial', 'documento', 'contacto', 'activo', 'acciones'];

  ngOnInit(): void {
    this.cargar(true);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.startsWith('/app/clientes')) {
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

    const { q, soloActivos } = this.filtroForm.value;

    this.loading = true;
    this.svc.listar(q ?? null, soloActivos ?? null)
      .pipe(
        timeout(8000),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (res) => {
          this.data = res ?? [];
        },
        error: () => {
          this.snack.open('Error cargando clientes', 'Cerrar', { duration: 2500 });
        }
      });
  }

  limpiar(): void {
    this.filtroForm.reset({ q: '', soloActivos: true });
    this.cargar(true);
  }

  abrirCrear(): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      width: '720px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.cargar(true);
    });
  }

  abrirEditar(row: ClienteResponse): void {
    const ref = this.dialog.open(ClienteDialogComponent, {
      width: '720px',
      data: { mode: 'edit', cliente: row }
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.cargar(true);
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
    razonSocial: ['', Validators.required],
    direccion: [''],
    telefono: [''],
    email: ['', Validators.email],
  });

  constructor(
    private ref: MatDialogRef<ClienteDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; cliente?: ClienteResponse }
  ) {
    this.mode = data.mode;

    if (data.cliente) {
      this.clienteId = data.cliente.idCliente;
      this.form.patchValue({
        tipoDocumento: data.cliente.tipoDocumento ?? null,
        numeroDocumento: data.cliente.numeroDocumento ?? '',
        razonSocial: data.cliente.razonSocial,
        direccion: data.cliente.direccion ?? '',
        telefono: data.cliente.telefono ?? '',
        email: data.cliente.email ?? '',
      });
    }
  }

  close(ok: boolean): void {
    this.ref.close(ok);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const raw = this.form.getRawValue();
    const payload: ClienteCrearRequest | ClienteActualizarRequest = {
      tipoDocumento: raw.tipoDocumento ?? null,
      numeroDocumento: (raw.numeroDocumento ?? '').trim() || null,
      razonSocial: (raw.razonSocial ?? '').trim(),
      direccion: (raw.direccion ?? '').trim() || null,
      telefono: (raw.telefono ?? '').trim() || null,
      email: (raw.email ?? '').trim() || null,
      usuario: 'admin'
    };

    const obs = this.mode === 'create'
      ? this.svc.crear(payload)
      : this.svc.actualizar(this.clienteId!, payload);

    obs.subscribe({
      next: () => this.ref.close(true),
      error: () => { this.loading = false; }
    });
  }
}

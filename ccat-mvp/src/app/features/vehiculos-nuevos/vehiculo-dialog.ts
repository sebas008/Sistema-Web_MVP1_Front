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
import { AuthService } from '../../core/services/auth';

type VehiculoRow = {
  idVehiculo: number;
  codigoVehiculo?: string;
  codigoExterno?: string;
  vin?: string;
  marca: string;
  modelo: string;
  modeloLegal?: string;
  tipoVehiculo?: string;
  anio?: number;
  version?: string;
  color?: string;
  colorExterior?: string;
  colorInterior?: string;
  precioCompra?: number;
  precioVenta?: number;
  precioLista?: number;
  tipoTransmision?: string;
  numeroAsientos?: number;
  numeroPuertas?: number;
  cilindrajeCc?: string;
  potenciaHp?: string;
  tipoCombustible?: string;
  numeroMotor?: string;
  numeroChasis?: string;
  modeloTecnico?: string;
  codigoSap?: string;
  pesoBruto?: number;
  cargaUtil?: number;
  estadoVehiculo?: string;
  ubicacion?: string;
  seccionAsignada?: string;
  fechaIngreso?: string;
  catalitico?: boolean;
  tipoCatalitico?: string;
  bonoUsd?: number;
  pagado?: boolean;
  testDrive?: boolean;
  unidadTestDrive?: string;
  km0?: boolean;
  observacion?: string;
  activo: boolean;
  stockActual?: number;
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
  styleUrls: ['./vehiculo-dialog.scss'],
})
export class VehiculoDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(VehiculosNuevosService);
  private auth = inject(AuthService);
  private dialogRef = inject(MatDialogRef<VehiculoDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as VehiculoRow | null;

  loading = false;
  errorMsg = '';
  debugMsg = '';

  form = this.fb.group({
    codigoVehiculo: [''],
    codigoExterno: [''],
    vin: [''],
    marca: ['', [Validators.required]],
    modelo: ['', [Validators.required]],
    modeloLegal: [''],
    tipoVehiculo: [''],
    anio: [new Date().getFullYear(), [Validators.min(1900)]],
    version: [''],
    modeloTecnico: [''],
    tipoTransmision: [''],
    colorExterior: [''],
    colorInterior: [''],
    precioCompra: [0],
    precioVenta: [0],
    precioLista: [0],
    numeroAsientos: [null as number | null],
    numeroPuertas: [null as number | null],
    cilindrajeCc: [''],
    potenciaHp: [''],
    tipoCombustible: [''],
    numeroMotor: [''],
    numeroChasis: [''],
    codigoSap: [''],
    pesoBruto: [null as number | null],
    cargaUtil: [null as number | null],
    estadoVehiculo: ['DISPONIBLE'],
    ubicacion: [''],
    seccionAsignada: [''],
    fechaIngreso: [''],
    catalitico: [false],
    tipoCatalitico: [''],
    bonoUsd: [null as number | null],
    pagado: [false],
    testDrive: [false],
    unidadTestDrive: [''],
    km0: [true],
    observacion: [''],
    activo: [true],
    usuario: [this.auth.getUsuario() ?? 'admin', [Validators.required]],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        codigoVehiculo: this.data.codigoVehiculo ?? '',
        codigoExterno: this.data.codigoExterno ?? '',
        vin: this.data.vin ?? '',
        marca: this.data.marca,
        modelo: this.data.modelo,
        modeloLegal: this.data.modeloLegal ?? '',
        tipoVehiculo: this.data.tipoVehiculo ?? '',
        anio: this.data.anio ?? new Date().getFullYear(),
        version: this.data.version ?? '',
        modeloTecnico: this.data.modeloTecnico ?? '',
        tipoTransmision: this.data.tipoTransmision ?? '',
        colorExterior: this.data.colorExterior ?? this.data.color ?? '',
        colorInterior: this.data.colorInterior ?? '',
        precioCompra: this.data.precioCompra ?? 0,
        precioVenta: this.data.precioVenta ?? this.data.precioLista ?? 0,
        precioLista: this.data.precioLista ?? this.data.precioVenta ?? 0,
        numeroAsientos: this.data.numeroAsientos ?? null,
        numeroPuertas: this.data.numeroPuertas ?? null,
        cilindrajeCc: this.data.cilindrajeCc ?? '',
        potenciaHp: this.data.potenciaHp ?? '',
        tipoCombustible: this.data.tipoCombustible ?? '',
        numeroMotor: this.data.numeroMotor ?? '',
        numeroChasis: this.data.numeroChasis ?? '',
        codigoSap: this.data.codigoSap ?? '',
        pesoBruto: this.data.pesoBruto ?? null,
        cargaUtil: this.data.cargaUtil ?? null,
        estadoVehiculo: this.data.estadoVehiculo ?? 'DISPONIBLE',
        ubicacion: this.data.ubicacion ?? '',
        seccionAsignada: this.data.seccionAsignada ?? '',
        fechaIngreso: this.toDateInput(this.data.fechaIngreso),
        catalitico: !!this.data.catalitico,
        tipoCatalitico: this.data.tipoCatalitico ?? '',
        bonoUsd: this.data.bonoUsd ?? null,
        pagado: !!this.data.pagado,
        testDrive: !!this.data.testDrive,
        unidadTestDrive: this.data.unidadTestDrive ?? '',
        km0: this.data.km0 ?? true,
        observacion: this.data.observacion ?? '',
        activo: this.data.activo,
        usuario: this.auth.getUsuario() ?? 'admin',
      });
    }
  }

  guardar(): void {
    console.log('[VehiculoDialog] click guardar');
    this.debugMsg = '';
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const invalidos = Object.keys(this.form.controls)
        .filter((key) => this.form.get(key)?.invalid)
        .join(', ');
      this.errorMsg = 'Formulario inválido. Revisar: ' + invalidos;
      console.warn('[VehiculoDialog] formulario inválido:', invalidos, this.form.getRawValue());
      return;
    }

    this.loading = true;

    const v = this.form.getRawValue();
    const payloadBase: VehiculoNuevoCrearRequest = {
      codigoVehiculo: this.toNullable(v.codigoVehiculo),
      codigoExterno: this.toNullable(v.codigoExterno),
      vin: this.toNullable(v.vin),
      marca: (v.marca ?? '').trim(),
      modelo: (v.modelo ?? '').trim(),
      modeloLegal: this.toNullable(v.modeloLegal),
      tipoVehiculo: this.toNullable(v.tipoVehiculo),
      anio: this.toNumberOrNull(v.anio),
      version: this.toNullable(v.version),
      modeloTecnico: this.toNullable(v.modeloTecnico),
      tipoTransmision: this.toNullable(v.tipoTransmision),
      color: this.toNullable(v.colorExterior),
      colorExterior: this.toNullable(v.colorExterior),
      colorInterior: this.toNullable(v.colorInterior),
      precioCompra: this.toNumberOrNull(v.precioCompra),
      precioVenta: this.toNumberOrNull(v.precioVenta),
      precioLista: this.toNumberOrNull(v.precioLista ?? v.precioVenta),
      numeroAsientos: this.toNumberOrNull(v.numeroAsientos),
      numeroPuertas: this.toNumberOrNull(v.numeroPuertas),
      cilindrajeCc: this.toNullable(v.cilindrajeCc),
      potenciaHp: this.toNullable(v.potenciaHp),
      tipoCombustible: this.toNullable(v.tipoCombustible),
      numeroMotor: this.toNullable(v.numeroMotor),
      numeroChasis: this.toNullable(v.numeroChasis),
      codigoSap: this.toNullable(v.codigoSap),
      pesoBruto: this.toNumberOrNull(v.pesoBruto),
      cargaUtil: this.toNumberOrNull(v.cargaUtil),
      estadoVehiculo: this.toNullable(v.estadoVehiculo),
      ubicacion: this.toNullable(v.ubicacion),
      seccionAsignada: this.toNullable(v.seccionAsignada),
      fechaIngreso: this.toNullable(v.fechaIngreso),
      catalitico: !!v.catalitico,
      tipoCatalitico: this.toNullable(v.tipoCatalitico),
      bonoUsd: this.toNumberOrNull(v.bonoUsd),
      pagado: !!v.pagado,
      testDrive: !!v.testDrive,
      unidadTestDrive: this.toNullable(v.unidadTestDrive),
      km0: !!v.km0,
      observacion: this.toNullable(v.observacion),
      activo: !!v.activo,
      usuario: (v.usuario ?? this.auth.getUsuario() ?? 'admin').trim() || this.auth.getUsuario() || 'admin',
    };

    console.log('[VehiculoDialog] payload', payloadBase);

    const obs = this.data?.idVehiculo
      ? this.api.actualizar(this.data.idVehiculo, payloadBase as VehiculoNuevoActualizarRequest)
      : this.api.crear(payloadBase);

    obs.subscribe({
      next: () => {
        console.log('[VehiculoDialog] guardado ok');
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('[VehiculoDialog] error guardando', err);
        this.loading = false;
        this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo guardar el vehículo.';
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }

  private toNullable(value: string | null | undefined): string | null {
    const text = String(value ?? '').trim();
    return text ? text : null;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    const text = String(value);
    return text.length >= 10 ? text.slice(0, 10) : text;
  }
}

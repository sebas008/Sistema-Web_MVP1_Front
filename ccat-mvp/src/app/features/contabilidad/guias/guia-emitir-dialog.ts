import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GuiasService, GuiaEmitirRequest } from '../../../core/services/contabilidad/guias';
import { InventarioRepuestosService, StockProductoResponse } from '../../../core/services/inventario-repuestos';
import { VehiculosNuevosService, VehiculoNuevoResponse } from '../../../core/services/vehiculos-nuevos';

@Component({
  standalone: true,
  selector: 'app-guia-emitir-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './guia-emitir-dialog.html',
  styleUrls: ['./guia-emitir-dialog.scss'],
})
export class GuiaEmitirDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<GuiaEmitirDialogComponent>);
  private api = inject(GuiasService);
  private inventario = inject(InventarioRepuestosService);
  private vehiculosApi = inject(VehiculosNuevosService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  readonly errorMsg$ = new BehaviorSubject<string>('');

  productos: StockProductoResponse[] = [];
  vehiculos: VehiculoNuevoResponse[] = [];

  tipos = [
    { value: 'REMISION', label: 'Remisión' },
    { value: 'TRASLADO', label: 'Traslado' },
  ];

  motivosRemision = ['VENTA', 'SERVICIO', 'DEVOLUCIÓN', 'OTROS'];
  motivosTraslado = ['ALMACÉN', 'TRASLADO INTERNO', 'CONSIGNACIÓN', 'OTROS'];

  form = this.fb.group({
    serie: ['G001', [Validators.required]],
    fechaEmision: [this.hoyIso(), [Validators.required]],
    tipo: ['REMISION', [Validators.required]],
    motivoTraslado: ['VENTA', [Validators.required]],
    puntoPartida: [''],
    puntoLlegada: [''],
    afectaStock: [true, [Validators.required]],
    usuario: ['admin', [Validators.required]],
    detalle: this.fb.array([] as any[]),
  });

  get detalle(): FormArray {
    return this.form.get('detalle') as FormArray;
  }

  get errorMsg() {
    return this.errorMsg$.value;
  }

  motivos(): string[] {
    return this.form.controls.tipo.value === 'TRASLADO' ? this.motivosTraslado : this.motivosRemision;
  }

  constructor() {
    this.agregarItem();
    this.cargarCombos();

    this.form.controls.tipo.valueChanges.subscribe(() => {
      const opts = this.motivos();
      this.form.controls.motivoTraslado.setValue(opts[0] ?? 'OTROS');
      this.cdr.markForCheck();
    });
  }

  private hoyIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  cargarCombos() {
    this.inventario.listarStock(null).subscribe({
      next: (p) => {
        this.productos = p ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.productos = [];
        this.cdr.markForCheck();
      },
    });

    this.vehiculosApi.listar(null, true).subscribe({
      next: (v) => {
        this.vehiculos = v ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.vehiculos = [];
        this.cdr.markForCheck();
      },
    });
  }

  agregarItem() {
    this.detalle.push(
      this.fb.group({
        item: [this.detalle.length + 1],
        tipo: ['PRODUCTO', [Validators.required]],
        idProducto: [null],
        idVehiculo: [null],
        descripcion: ['', [Validators.required]],
        cantidad: [1, [Validators.required, Validators.min(0.0001)]],
      })
    );
    this.cdr.markForCheck();
  }

  quitarItem(i: number) {
    this.detalle.removeAt(i);
    this.detalle.controls.forEach((c, idx) => c.get('item')?.setValue(idx + 1));
    this.cdr.markForCheck();
  }

  seleccionarProducto(i: number) {
    const g = this.detalle.at(i);
    const id = Number(g.get('idProducto')?.value ?? 0);
    const p = this.productos.find((x) => Number(x.idProducto ?? 0) === id);
    if (p) g.get('descripcion')?.setValue(p.nombre ?? p.descripcion ?? '');
  }

  seleccionarVehiculo(i: number) {
    const g = this.detalle.at(i);
    const id = Number(g.get('idVehiculo')?.value ?? 0);
    const v = this.vehiculos.find((x: any) => Number(x.idVehiculo ?? 0) === id);
    if (v) g.get('descripcion')?.setValue(`${v.marca ?? ''} ${v.modelo ?? ''} ${v.vin ?? ''}`.trim());
  }

  emitir() {
    if (this.form.invalid || this.detalle.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const req: GuiaEmitirRequest = {
      serie: v.serie!,
      fechaEmision: v.fechaEmision!,
      afectaStock: !!v.afectaStock,
      tipo: v.tipo!,
      motivoTraslado: v.motivoTraslado || null,
      puntoPartida: v.puntoPartida || null,
      puntoLlegada: v.puntoLlegada || null,
      usuario: v.usuario!,
      detalle: (v.detalle ?? []).map((d: any, idx: number) => ({
        item: idx + 1,
        tipo: d.tipo,
        idProducto: d.tipo === 'PRODUCTO' ? d.idProducto : null,
        idVehiculo: d.tipo === 'VEHICULO' ? d.idVehiculo : null,
        descripcion: d.descripcion,
        cantidad: Number(d.cantidad ?? 0),
      })),
    };

    this.loading = true;
    this.errorMsg$.next('');
    this.cdr.markForCheck();

    this.api.emitir(req).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        setTimeout(() => {
          this.errorMsg$.next(err?.error?.detail ?? err?.error?.message ?? 'No se pudo emitir la guía.');
          this.cdr.markForCheck();
        }, 0);
      },
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}

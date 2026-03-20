import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehiculosNuevosService, VehiculoNuevoResponse } from '../../core/services/vehiculos-nuevos';
import { VehiculoDialogComponent } from './vehiculo-dialog';

type VehiculoRow = {
  idVehiculo: number; codigoVehiculo: string; codigoExterno: string; vin: string; marca: string; modelo: string; modeloLegal: string; tipoVehiculo: string; anio: number; colorExterior: string; colorInterior: string; precioCompra: number; precioVenta: number; precioLista: number; estadoVehiculo: string; ubicacion: string; fechaIngreso: string; activo: boolean; stockActual: number; observacion: string;
  version?: string; color?: string; tipoTransmision?: string; numeroMotor?: string; numeroChasis?: string; tipoCombustible?: string; modeloTecnico?: string; seccionAsignada?: string; codigoSap?: string; bonoUsd?: number; pagado?: boolean; testDrive?: boolean; unidadTestDrive?: string; km0?: boolean; catalitico?: boolean; tipoCatalitico?: string; numeroAsientos?: number; numeroPuertas?: number; cilindrajeCc?: string; potenciaHp?: string; pesoBruto?: number; cargaUtil?: number;
};

@Component({
  standalone: true,
  selector: 'app-vehiculos-nuevos',
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatDialogModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './vehiculos-nuevos.html',
  styleUrls: ['./vehiculos-nuevos.scss'],
})
export class VehiculosNuevosComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  displayedColumns = ['codigo', 'vehiculo', 'tipo', 'precio', 'estado', 'ubicacion', 'stock', 'acciones'];
  q = '';
  dataSource: VehiculoRow[] = [];
  loading = false;
  errorMsg = '';

  constructor(private vehiculos: VehiculosNuevosService) {}

  ngOnInit(): void {
    this.cargar(true);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntil(this.destroy$)).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.startsWith('/app/vehiculos-nuevos') || url === '/app/vehiculos') this.cargar(true);
    });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  cargar(force = false): void {
    if (this.loading && !force) return;
    this.loading = true; this.errorMsg = '';
    this.vehiculos.listar(this.q || null, null).subscribe({
      next: (rows) => { this.dataSource = (rows ?? []).map(this.mapRow); this.loading = false; },
      error: () => { this.errorMsg = 'No se pudo cargar la lista de vehículos.'; this.dataSource = []; this.loading = false; },
    });
  }
  private mapRow = (r: VehiculoNuevoResponse): VehiculoRow => ({ idVehiculo: Number(r.idVehiculo ?? 0), codigoVehiculo: r.codigoVehiculo ?? '-', codigoExterno: r.codigoExterno ?? '-', vin: r.vin ?? '-', marca: r.marca ?? '', modelo: r.modelo ?? '', modeloLegal: r.modeloLegal ?? '-', tipoVehiculo: r.tipoVehiculo ?? '-', anio: Number(r.anio ?? 0), colorExterior: r.colorExterior ?? r.color ?? '-', colorInterior: r.colorInterior ?? '-', precioCompra: Number(r.precioCompra ?? 0), precioVenta: Number(r.precioVenta ?? r.precioLista ?? 0), precioLista: Number(r.precioLista ?? 0), estadoVehiculo: r.estadoVehiculo ?? (r.activo ? 'DISPONIBLE' : 'INACTIVO'), ubicacion: r.ubicacion ?? '-', fechaIngreso: r.fechaIngreso ?? '', activo: !!r.activo, stockActual: Number(r.stockActual ?? 0), observacion: r.observacion ?? '', version: r.version ?? undefined, color: r.color ?? undefined, tipoTransmision: r.tipoTransmision ?? undefined, numeroMotor: r.numeroMotor ?? undefined, numeroChasis: r.numeroChasis ?? undefined, tipoCombustible: r.tipoCombustible ?? undefined, modeloTecnico: r.modeloTecnico ?? undefined, seccionAsignada: r.seccionAsignada ?? undefined, codigoSap: r.codigoSap ?? undefined, bonoUsd: r.bonoUsd ?? undefined, pagado: r.pagado ?? undefined, testDrive: r.testDrive ?? undefined, unidadTestDrive: r.unidadTestDrive ?? undefined, km0: r.km0 ?? undefined, catalitico: r.catalitico ?? undefined, tipoCatalitico: r.tipoCatalitico ?? undefined, numeroAsientos: r.numeroAsientos ?? undefined, numeroPuertas: r.numeroPuertas ?? undefined, cilindrajeCc: r.cilindrajeCc ?? undefined, potenciaHp: r.potenciaHp ?? undefined, pesoBruto: r.pesoBruto ?? undefined, cargaUtil: r.cargaUtil ?? undefined });
  nuevoVehiculo(): void { const ref = this.dialog.open(VehiculoDialogComponent, { width: '1200px', maxWidth: '96vw', maxHeight: '94vh', data: null }); ref.afterClosed().subscribe((ok: boolean) => { if (ok) { this.snack.open('Vehículo guardado correctamente', 'OK', { duration: 1800 }); this.cargar(true); } }); }
  editar(v: VehiculoRow): void { const ref = this.dialog.open(VehiculoDialogComponent, { width: '1200px', maxWidth: '96vw', maxHeight: '94vh', data: v }); ref.afterClosed().subscribe((ok: boolean) => { if (ok) { this.snack.open('Cambios guardados', 'OK', { duration: 1800 }); this.cargar(true); } }); }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { VehiculosNuevosService, VehiculoNuevoResponse } from '../../core/services/vehiculos-nuevos';
import { VehiculoDialogComponent } from './vehiculo-dialog';

type VehiculoRow = {
  idVehiculo: number;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  precioLista: number;
  activo: boolean;
  stockActual: number;
};

@Component({
  standalone: true,
  selector: 'app-vehiculos-nuevos',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './vehiculos-nuevos.html',
  styleUrls: ['./vehiculos-nuevos.scss'],
})
export class VehiculosNuevosComponent {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  // Stock de vehículos nuevos no se gestiona en el MVP (evitamos confusión en demo)
  displayedColumns = ['vin', 'vehiculo', 'anio', 'color', 'precio', 'estado', 'acciones'];

  q = '';
  dataSource: VehiculoRow[] = [];

  loading = false;
  errorMsg = '';

  constructor(private vehiculos: VehiculosNuevosService) {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorMsg = '';

    this.vehiculos.listar(this.q || null, null).subscribe({
      next: (rows) => {
        this.dataSource = (rows ?? []).map(this.mapRow);
        this.loading = false;
      },
      error: (err) => {
        console.error('Vehiculos error:', err);
        this.errorMsg = 'No se pudo cargar la lista de vehículos.';
        this.dataSource = [];
        this.loading = false;
      },
    });
  }

  private mapRow = (r: VehiculoNuevoResponse): VehiculoRow => {
    return {
      idVehiculo: Number(r.idVehiculo ?? 0),
      vin: r.vin ?? '-',
      marca: r.marca ?? '',
      modelo: r.modelo ?? '',
      anio: Number(r.anio ?? 0),
      color: r.color ?? '-',
      precioLista: Number(r.precioLista ?? 0),
      activo: !!r.activo,
      stockActual: Number(r.stockActual ?? 0),
    };
  };

  nuevoVehiculo() {
    const ref = this.dialog.open(VehiculoDialogComponent, { width: '760px', data: null });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.snack.open('Vehículo guardado correctamente', 'OK', { duration: 1800 });
        this.cargar();
      }
    });
  }

  editar(v: VehiculoRow) {
    const ref = this.dialog.open(VehiculoDialogComponent, { width: '760px', data: v });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.snack.open('Cambios guardados', 'OK', { duration: 1800 });
        this.cargar();
      }
    });
  }
}

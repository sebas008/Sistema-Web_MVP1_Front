import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

type VehiculoRow = {
  codigo: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  precio: number;
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
};

@Component({
  standalone: true,
  selector: 'app-vehiculos-nuevos',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  templateUrl: './vehiculos-nuevos.component.html',
  styleUrls: ['./vehiculos-nuevos.component.scss']
})
export class VehiculosNuevosComponent {

  displayedColumns = [
    'codigo',
    'vehiculo',
    'anio',
    'color',
    'precio',
    'estado',
    'acciones'
  ];

  // 🔧 MOCK (API después)
  dataSource: VehiculoRow[] = [
    {
      codigo: 'VN-001',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2024,
      color: 'Blanco',
      precio: 89000,
      estado: 'DISPONIBLE'
    },
    {
      codigo: 'VN-002',
      marca: 'Hyundai',
      modelo: 'Tucson',
      anio: 2023,
      color: 'Gris',
      precio: 132000,
      estado: 'RESERVADO'
    },
    {
      codigo: 'VN-003',
      marca: 'Kia',
      modelo: 'Rio',
      anio: 2024,
      color: 'Rojo',
      precio: 72000,
      estado: 'VENDIDO'
    }
  ];

  nuevoVehiculo() {
    alert('MVP: abrir modal Nuevo Vehículo');
  }

  editar(v: VehiculoRow) {
    alert(`Editar ${v.marca} ${v.modelo}`);
  }

  eliminar(v: VehiculoRow) {
    alert(`Eliminar ${v.codigo}`);
  }
}

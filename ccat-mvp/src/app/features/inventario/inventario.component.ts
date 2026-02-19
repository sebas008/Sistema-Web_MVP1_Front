import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-inventario',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {

  displayedColumns = [
    'codigo',
    'nombre',
    'categoria',
    'stock',
    'precio',
    'acciones'
  ];

  // 🔧 MOCK (luego conectas API real)
  dataSource = [
    {
      codigo: 'REP-001',
      nombre: 'Filtro de aceite',
      categoria: 'Motor',
      stock: 25,
      precio: 45.00
    },
    {
      codigo: 'REP-002',
      nombre: 'Pastillas de freno',
      categoria: 'Frenos',
      stock: 12,
      precio: 120.00
    },
    {
      codigo: 'REP-003',
      nombre: 'Bujía',
      categoria: 'Motor',
      stock: 80,
      precio: 25.50
    }
  ];

}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  // placeholders para el demo (luego conectas API)
  kpis = [
    { title: 'Repuestos en stock', value: '128', icon: 'inventory_2' },
    { title: 'Vehículos nuevos', value: '12', icon: 'directions_car' },
    { title: 'Facturas hoy', value: '5', icon: 'receipt_long' },
    { title: 'Clientes', value: '42', icon: 'badge' }
  ];
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FormsModule } from '@angular/forms';


type UsuarioRow = {
  idUsuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  email?: string | null;
  activo: boolean;
  roles: string[];
};

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {

  displayedColumns = ['usuario', 'nombres', 'email', 'roles', 'estado', 'acciones'];

  q = '';
  soloActivos = false;

  // 🔧 MOCK (luego lo reemplazamos por API)
  private data: UsuarioRow[] = [
    {
      idUsuario: 1,
      username: 'admin',
      nombres: 'Admin',
      apellidos: 'CCAT',
      email: 'admin@local',
      activo: true,
      roles: ['ADMIN']
    },
    {
      idUsuario: 2,
      username: 'user1',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@local',
      activo: true,
      roles: ['USER']
    },
    {
      idUsuario: 3,
      username: 'inactivo',
      nombres: 'Mario',
      apellidos: 'Gómez',
      email: null,
      activo: false,
      roles: ['USER']
    }
  ];

  get dataSource(): UsuarioRow[] {
    const query = this.q.trim().toLowerCase();

    return this.data
      .filter(u => !this.soloActivos || u.activo)
      .filter(u => {
        if (!query) return true;
        return (
          u.username.toLowerCase().includes(query) ||
          `${u.nombres} ${u.apellidos}`.toLowerCase().includes(query) ||
          (u.email ?? '').toLowerCase().includes(query) ||
          u.roles.join(',').toLowerCase().includes(query)
        );
      });
  }

  // Acciones (placeholder para MVP)
  nuevoUsuario() {
    alert('MVP: aquí abrimos modal "Nuevo Usuario" (siguiente paso).');
  }

  editar(u: UsuarioRow) {
    alert(`MVP: editar usuario ${u.username}`);
  }

  cambiarPassword(u: UsuarioRow) {
    alert(`MVP: cambiar password de ${u.username}`);
  }

  asignarRol(u: UsuarioRow) {
    alert(`MVP: asignar rol a ${u.username}`);
  }

  toggleActivo(u: UsuarioRow) {
    u.activo = !u.activo;
    // aquí luego llamamos PATCH /usuarios/{id}/estado
  }

  eliminar(u: UsuarioRow) {
    alert(`MVP: eliminar (o desactivar) ${u.username}`);
  }
}

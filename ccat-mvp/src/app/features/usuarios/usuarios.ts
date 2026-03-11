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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UsuariosService, UsuarioResponse } from '../../core/services/usuarios';
import { AuthService } from '../../core/services/auth';
import { UsuarioDialogComponent } from './usuario-dialog';
import { UsuarioRolesDialogComponent } from './usuario-roles-dialog';


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
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent {

  loading = false;

  displayedColumns = ['usuario', 'nombres', 'email', 'roles', 'estado', 'acciones'];

  q = '';
  soloActivos = false;

  private data: UsuarioRow[] = [];

  constructor(private usuarios: UsuariosService, private auth: AuthService, private dialog: MatDialog) {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.usuarios.listar(null, this.soloActivos ? true : null).subscribe({
      next: (rows) => {
        this.data = rows.map(this.mapUsuario);
        this.cargarRoles();
        if (this.data.length === 0) this.loading = false;
      },
      error: (err) => {
        console.error('Usuarios error:', err);
        this.data = [];
        this.loading = false;
      }
    });
  }

  private cargarRoles(): void {
    if (this.data.length === 0) return;

    // Carga roles por usuario (usp_Usuario_Get). Si falla para alguno, no rompe la tabla.
    forkJoin(
      this.data.map((u) =>
        this.usuarios.obtener(u.idUsuario).pipe(
          map((d) => ({ idUsuario: u.idUsuario, roles: (d.roles ?? []).map(r => r.nombre) })),
          catchError(() => of({ idUsuario: u.idUsuario, roles: [] as string[] }))
        )
      )
    ).subscribe((items) => {
      const mapRoles = new Map(items.map(i => [i.idUsuario, i.roles] as const));
      this.data = this.data.map(u => ({ ...u, roles: mapRoles.get(u.idUsuario) ?? [] }));
      this.loading = false;
    });
  }

  private mapUsuario = (u: UsuarioResponse): UsuarioRow => ({
    idUsuario: u.idUsuario,
    username: u.username,
    nombres: u.nombres ?? '',
    apellidos: u.apellidos ?? '',
    email: u.email ?? null,
    activo: u.activo,
    roles: []
  });

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

  nuevoUsuario() {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '720px', data: null });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar();
    });
  }

  editar(u: UsuarioRow) {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '720px', data: u });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar();
    });
  }

  asignarRol(u: UsuarioRow) {
    const ref = this.dialog.open(UsuarioRolesDialogComponent, { width: '720px', data: u });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar();
    });
  }

  toggleActivo(u: UsuarioRow) {
    const nuevoEstado = !u.activo;
    const usuarioSesion = this.auth.getSession()?.username ?? 'system';

    this.usuarios.cambiarEstado(u.idUsuario, nuevoEstado, usuarioSesion).subscribe({
      next: () => (u.activo = nuevoEstado),
      error: (err) => {
        console.error('Cambio estado error:', err);
        // UI: revert
        u.activo = !nuevoEstado;
      }
    });
  }
}

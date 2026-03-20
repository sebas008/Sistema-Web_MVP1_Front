import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

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
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormsModule } from '@angular/forms';

import { Subject, forkJoin, of } from 'rxjs';
import { catchError, filter, map, takeUntil, timeout } from 'rxjs/operators';

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
    MatTooltipModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  errorMsg = '';
  pendingToggleId: number | null = null;

  displayedColumns = ['usuario', 'nombres', 'email', 'roles', 'estado', 'acciones'];

  q = '';
  soloActivos = false;

  private data: UsuarioRow[] = [];

  constructor(
    private usuarios: UsuariosService,
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.cargar(true), 0);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.startsWith('/app/usuarios')) {
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

    this.loading = true;
    this.errorMsg = '';

    this.usuarios.listar(null, this.soloActivos ? true : null)
      .pipe(timeout(8000))
      .subscribe({
        next: (rows) => {
          this.data = (rows ?? []).map(this.mapUsuario);
          this.cargarRoles();
          if (this.data.length === 0) this.loading = false;
        },
        error: (err) => {
          console.error('Usuarios error:', err);
          this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo cargar usuarios.';
          this.data = [];
          this.loading = false;
        }
      });
  }

  private cargarRoles(): void {
    if (this.data.length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(
      this.data.map((u) =>
        this.usuarios.obtener(u.idUsuario).pipe(
          timeout(8000),
          map((d) => ({
            idUsuario: u.idUsuario,
            roles: Array.isArray(d?.roles) && d.roles.length
              ? d.roles.map(r => r.nombre)
              : this.normalizeRoles((d as any)?.rolNombre ?? null)
          })),
          catchError(() => of({ idUsuario: u.idUsuario, roles: u.roles ?? [] as string[] }))
        )
      )
    ).subscribe({
      next: (items) => {
        const mapRoles = new Map(items.map(i => [i.idUsuario, i.roles] as const));
        this.data = this.data.map(u => ({ ...u, roles: mapRoles.get(u.idUsuario) ?? [] }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapUsuario = (u: UsuarioResponse): UsuarioRow => ({
    idUsuario: u.idUsuario,
    username: u.username,
    nombres: u.nombres ?? '',
    apellidos: u.apellidos ?? '',
    email: u.email ?? null,
    activo: u.activo,
    roles: this.normalizeRoles((u as any).rolNombre ?? null)
  });

  private normalizeRoles(rolNombre?: string | null): string[] {
    return (rolNombre ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  roleClass(role: string): string {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'admin';
    if (r.includes('CONTAB')) return 'finance';
    if (r.includes('VENTA')) return 'sales';
    if (r.includes('COORDINADOR')) return 'coord';
    return 'default';
  }

  trackRole(_: number, role: string): string {
    return role;
  }

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

  nuevoUsuario(): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '720px', data: null });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }

  editar(u: UsuarioRow): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '720px', data: u });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }

  asignarRol(u: UsuarioRow): void {
    const ref = this.dialog.open(UsuarioRolesDialogComponent, { width: '720px', data: u });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.cargar(true);
    });
  }

  toggleActivo(u: UsuarioRow): void {
    if (this.pendingToggleId === u.idUsuario) return;

    const nuevoEstado = !u.activo;
    const usuarioSesion = this.auth.getUsuario() ?? 'admin';

    this.pendingToggleId = u.idUsuario;
    this.errorMsg = '';

    this.usuarios.cambiarEstado(u.idUsuario, nuevoEstado, usuarioSesion).subscribe({
      next: () => {
        this.pendingToggleId = null;
        this.cargar(true);
      },
      error: (err) => {
        console.error('Cambio estado error:', err);
        this.pendingToggleId = null;
        this.errorMsg = err?.error?.detail ?? err?.error?.message ?? 'No se pudo cambiar el estado.';
        this.cargar(true);
      }
    });
  }
}

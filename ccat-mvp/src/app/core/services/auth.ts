import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  username?: string;
  usuario?: string;
  nombre?: string;
  fullName?: string;
  nombres?: string;
  apellidos?: string;
  roles?: string[];
  role?: string;
  [key: string]: any;
}

const SESSION_KEY = 'ccat_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Auth`;

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((session) => this.setSession(session)));
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  }

  getSession(): LoginResponse | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const s = this.getSession();
    return !!s && !!(s.token || s.username || s.usuario || s.nombre || s.fullName || s.nombres);
  }

  getUsername(): string {
    const s = this.getSession();
    return (s?.username ?? s?.usuario ?? '').toString();
  }

  getUsuario(): string {
    return this.getUsername();
  }

  getDisplayName(): string {
    const s = this.getSession();
    const nombres = [s?.nombres ?? s?.nombre ?? '', s?.apellidos ?? ''].join(' ').trim();
    const name = (nombres || s?.fullName || s?.username || s?.usuario || '').toString().trim();
    return name || 'Usuario';
  }

  getRoles(): string[] {
    const s = this.getSession();
    const roles = Array.isArray(s?.roles) ? s!.roles : [];
    const role = s?.role ? [String(s.role)] : [];

    return [...roles, ...role]
      .map((x) => this.normalizeRole(x))
      .filter((x, i, arr) => !!x && arr.indexOf(x) === i);
  }

  getRoleLabels(): string[] {
    return this.getRoles().map((r) => this.prettyRole(r));
  }

  canAccess(moduleKey: string): boolean {
    if (!this.isLoggedIn()) return false;

    const roles = this.getRoles();
    if (!roles.length) return true;

    const key = this.routeToKey(moduleKey);
    const allow: Record<string, string[]> = {
      dashboard: [
        'vendedor',
        'coordinador de ventas',
        'coordinador ventas',
        'coordinador del producto',
        'coordinador producto',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      inventario: [
        'vendedor',
        'coordinador de ventas',
        'coordinador ventas',
        'coordinador del producto',
        'coordinador producto',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      compras: [
        'coordinador del producto',
        'coordinador producto',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      facturacion: [
        'coordinador de ventas',
        'coordinador ventas',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      guias: [
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      'vehiculos-nuevos': [
        'vendedor',
        'coordinador de ventas',
        'coordinador ventas',
        'coordinador del producto',
        'coordinador producto',
        'admin',
        'administrador',
        'bruno'
      ],
      clientes: [
        'vendedor',
        'coordinador de ventas',
        'coordinador ventas',
        'coordinador del producto',
        'coordinador producto',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      'servicios-mecanicos': [
        'coordinador del producto',
        'coordinador producto',
        'contabilidad',
        'admin',
        'administrador',
        'bruno'
      ],
      usuarios: [
        'admin',
        'administrador',
        'bruno'
      ],
    };

    const allowed = (allow[key] ?? []).map((x) => this.normalizeRole(x));
    if (!allowed.length) return true;

    return roles.some((r) => allowed.includes(r));
  }

  getHomeRoute(): string {
    if (!this.isLoggedIn()) return '/login';

    const order = [
      'dashboard',
      'inventario',
      'vehiculos-nuevos',
      'clientes',
      'facturacion',
      'compras',
      'guias',
      'servicios-mecanicos',
      'usuarios'
    ];

    for (const key of order) {
      if (this.canAccess(key)) {
        switch (key) {
          case 'dashboard': return '/app/dashboard';
          case 'inventario': return '/app/inventario';
          case 'vehiculos-nuevos': return '/app/vehiculos-nuevos';
          case 'clientes': return '/app/clientes';
          case 'facturacion': return '/app/contabilidad/facturacion';
          case 'compras': return '/app/contabilidad/compras';
          case 'guias': return '/app/contabilidad/guias';
          case 'servicios-mecanicos': return '/app/servicios-mecanicos';
          case 'usuarios': return '/app/usuarios';
        }
      }
    }

    return '/app/dashboard';
  }

  private routeToKey(route: string): string {
    const r = (route || '').toLowerCase();
    if (r.includes('dashboard')) return 'dashboard';
    if (r.includes('inventario')) return 'inventario';
    if (r.includes('facturacion')) return 'facturacion';
    if (r.includes('compras')) return 'compras';
    if (r.includes('guias')) return 'guias';
    if (r.includes('vehiculos')) return 'vehiculos-nuevos';
    if (r.includes('servicios')) return 'servicios-mecanicos';
    if (r.includes('clientes')) return 'clientes';
    if (r.includes('usuarios')) return 'usuarios';
    return r.replace(/^\/+/, '').replace(/^app\/+/, '');
  }

  private setSession(session: LoginResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private normalizeRole(value: string): string {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private prettyRole(value: string): string {
    const role = this.normalizeRole(value);

    switch (role) {
      case 'admin':
      case 'administrador':
        return 'Administrador';
      case 'bruno':
        return 'Bruno';
      case 'vendedor':
        return 'Vendedor';
      case 'coordinador de ventas':
      case 'coordinador ventas':
        return 'Coordinador de Ventas';
      case 'coordinador del producto':
      case 'coordinador producto':
        return 'Coordinador del Producto';
      case 'contabilidad':
        return 'Contabilidad';
      default:
        return value;
    }
  }
}

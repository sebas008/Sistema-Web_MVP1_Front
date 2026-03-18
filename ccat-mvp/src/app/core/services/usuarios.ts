import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface UsuarioResponse {
  idUsuario: number;
  username: string;
  email?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  activo: boolean;
  rolNombre?: string | null;
}

export interface RolResponse {
  idRol: number;
  nombre: string;
  activo?: boolean;
}

export interface UsuarioDetalleResponse extends UsuarioResponse {
  roles: RolResponse[];
}

export interface UsuarioCrearRequest {
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  email?: string | null;
  rolNombre?: string | null;
  activo?: boolean;
  usuario: string;
}

export interface UsuarioActualizarRequest {
  nombres: string;
  apellidos: string;
  email?: string | null;
  activo: boolean;
  usuario: string;
}

export interface UsuarioAsignarRolRequest {
  csvRoles: string;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, activo?: boolean | null): Observable<UsuarioResponse[]> {
    let params = new HttpParams().set('_ts', Date.now().toString());
    if (q) params = params.set('q', q);
    if (activo !== null && activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<UsuarioResponse[]>(this.baseUrl, { params });
  }

  obtener(idUsuario: number): Observable<UsuarioDetalleResponse> {
    return this.http.get<UsuarioDetalleResponse>(`${this.baseUrl}/${idUsuario}`);
  }

  cambiarEstado(idUsuario: number, activo: boolean, usuario: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${idUsuario}/estado`, { activo, usuario });
  }

  crear(payload: UsuarioCrearRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.baseUrl, payload);
  }

  actualizar(idUsuario: number, payload: UsuarioActualizarRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.baseUrl}/${idUsuario}`, payload);
  }

  asignarRol(idUsuario: number, payload: UsuarioAsignarRolRequest): Observable<UsuarioDetalleResponse> {
    return this.http.patch<UsuarioDetalleResponse>(`${this.baseUrl}/${idUsuario}/rol`, payload);
  }
}

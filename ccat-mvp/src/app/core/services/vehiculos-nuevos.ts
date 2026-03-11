import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// Alineado al API: CCAT.Mvp1.Api.DTOs.VehiculosNuevos.VehiculoNuevoResponse
export interface VehiculoNuevoResponse {
  idVehiculo: number;
  vin?: string | null;
  marca: string;
  modelo: string;
  anio: number;
  version?: string | null;
  color?: string | null;
  precioLista?: number | null;
  activo: boolean;
  stockActual?: number | null;
}

export interface VehiculoNuevoCrearRequest {
  vin?: string | null;
  marca: string;
  modelo: string;
  anio?: number | null;
  version?: string | null;
  color?: string | null;
  precioLista?: number | null;
  activo?: boolean;
  usuario: string;
}

export interface VehiculoNuevoActualizarRequest extends VehiculoNuevoCrearRequest {}

@Injectable({ providedIn: 'root' })
export class VehiculosNuevosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/vehiculos-nuevos`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, activo?: boolean | null): Observable<VehiculoNuevoResponse[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (activo !== null && activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<VehiculoNuevoResponse[]>(this.baseUrl, { params });
  }

  crear(payload: VehiculoNuevoCrearRequest): Observable<VehiculoNuevoResponse> {
    return this.http.post<VehiculoNuevoResponse>(this.baseUrl, payload);
  }

  actualizar(idVehiculo: number, payload: VehiculoNuevoActualizarRequest): Observable<VehiculoNuevoResponse> {
    return this.http.put<VehiculoNuevoResponse>(`${this.baseUrl}/${idVehiculo}`, payload);
  }

  cambiarEstado(idVehiculo: number, activo: boolean): Observable<VehiculoNuevoResponse> {
    return this.http.patch<VehiculoNuevoResponse>(`${this.baseUrl}/${idVehiculo}/estado`, { activo });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface VehiculoNuevoResponse {
  idVehiculo: number;

  vin?: string | null;
  marca: string;
  modelo: string;
  anio?: number | null;
  version?: string | null;
  color?: string | null;
  precioLista?: number | null;
  activo: boolean;
  stockActual?: number | null;

  codigoVehiculo?: string | null;
  codigoExterno?: string | null;
  modeloLegal?: string | null;
  tipoVehiculo?: string | null;
  precioCompra?: number | null;
  precioVenta?: number | null;
  tipoTransmision?: string | null;
  colorExterior?: string | null;
  colorInterior?: string | null;
  numeroAsientos?: number | null;
  numeroPuertas?: number | null;
  cilindrajeCc?: string | null;
  potenciaHp?: string | null;
  tipoCombustible?: string | null;
  numeroMotor?: string | null;
  numeroChasis?: string | null;
  modeloTecnico?: string | null;
  codigoSap?: string | null;
  pesoBruto?: number | null;
  cargaUtil?: number | null;
  estadoVehiculo?: string | null;
  ubicacion?: string | null;
  seccionAsignada?: string | null;
  fechaIngreso?: string | null;
  catalitico?: boolean | null;
  tipoCatalitico?: string | null;
  bonoUsd?: number | null;
  pagado?: boolean | null;
  testDrive?: boolean | null;
  unidadTestDrive?: string | null;
  km0?: boolean | null;
  observacion?: string | null;
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

  codigoVehiculo?: string | null;
  codigoExterno?: string | null;
  modeloLegal?: string | null;
  tipoVehiculo?: string | null;
  precioCompra?: number | null;
  precioVenta?: number | null;
  tipoTransmision?: string | null;
  colorExterior?: string | null;
  colorInterior?: string | null;
  numeroAsientos?: number | null;
  numeroPuertas?: number | null;
  cilindrajeCc?: string | null;
  potenciaHp?: string | null;
  tipoCombustible?: string | null;
  numeroMotor?: string | null;
  numeroChasis?: string | null;
  modeloTecnico?: string | null;
  codigoSap?: string | null;
  pesoBruto?: number | null;
  cargaUtil?: number | null;
  estadoVehiculo?: string | null;
  ubicacion?: string | null;
  seccionAsignada?: string | null;
  fechaIngreso?: string | null;
  catalitico?: boolean | null;
  tipoCatalitico?: string | null;
  bonoUsd?: number | null;
  pagado?: boolean | null;
  testDrive?: boolean | null;
  unidadTestDrive?: string | null;
  km0?: boolean | null;
  observacion?: string | null;
}

export interface VehiculoNuevoActualizarRequest extends VehiculoNuevoCrearRequest {}

@Injectable({ providedIn: 'root' })
export class VehiculosNuevosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/vehiculos-nuevos`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, activo?: boolean | null): Observable<VehiculoNuevoResponse[]> {
    let params = new HttpParams().set('_ts', String(Date.now()));
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

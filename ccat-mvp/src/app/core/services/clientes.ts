import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ClienteResponse {
  idCliente: number;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  razonSocial: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
  fechaCreacion?: string | null;
  usuarioCreacion?: string | null;
}

export interface ClienteCrearRequest {
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  razonSocial: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  usuario: string;
}

export interface ClienteActualizarRequest extends ClienteCrearRequest {}

export interface ClienteCambiarEstadoRequest {
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/clientes`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, soloActivos?: boolean | null): Observable<ClienteResponse[]> {
    let params = new HttpParams().set('_ts', Date.now().toString());
    if (q) params = params.set('q', q);
    if (soloActivos !== null && soloActivos !== undefined) params = params.set('soloActivos', soloActivos);
    return this.http.get<ClienteResponse[]>(this.baseUrl, { params });
  }

  obtener(idCliente: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/${idCliente}`);
  }

  crear(req: ClienteCrearRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.baseUrl, req);
  }

  actualizar(idCliente: number, req: ClienteActualizarRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.baseUrl}/${idCliente}`, req);
  }

  cambiarEstado(idCliente: number, activo: boolean): Observable<ClienteResponse> {
    const body: ClienteCambiarEstadoRequest = { activo };
    return this.http.patch<ClienteResponse>(`${this.baseUrl}/${idCliente}/estado`, body);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface OrdenServicioDetalle {
  idOrdenServicioDetalle: number;
  idOrdenServicio: number;
  item: number;
  tipo: string;
  idProducto?: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface OrdenServicio {
  idOrdenServicio: number;
  numeroOS?: string | null;
  idCliente?: number | null;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  kilometraje?: number | null;
  fechaIngreso?: string | null;
  fechaSalida?: string | null;
  estado: string;
  observacion?: string | null;
  subtotal: number;
  igv: number;
  total: number;
  detalle: OrdenServicioDetalle[];
}

export interface OrdenServicioCrearRequest {
  idCliente?: number | null;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  kilometraje?: number | null;
  observacion?: string | null;
  usuario: string;
}

export interface OrdenServicioCambiarEstadoRequest {
  estado: string;
}

export interface OrdenServicioDetalleAddRequest {
  tipo: 'SERVICIO' | 'REPUESTO';
  idProducto?: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class OrdenesServicioService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/ordenes-servicio`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, estado?: string | null): Observable<OrdenServicio[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (estado) params = params.set('estado', estado);
    return this.http.get<OrdenServicio[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<OrdenServicio> {
    return this.http.get<OrdenServicio>(`${this.baseUrl}/${id}`);
  }

  crear(req: OrdenServicioCrearRequest): Observable<OrdenServicio> {
    return this.http.post<OrdenServicio>(this.baseUrl, req);
  }

  cambiarEstado(id: number, estado: string): Observable<OrdenServicio> {
    const body: OrdenServicioCambiarEstadoRequest = { estado };
    return this.http.patch<OrdenServicio>(`${this.baseUrl}/${id}/estado`, body);
  }

  agregarDetalle(id: number, req: OrdenServicioDetalleAddRequest): Observable<OrdenServicio> {
    return this.http.post<OrdenServicio>(`${this.baseUrl}/${id}/detalle`, req);
  }

  removerDetalle(idDetalle: number, usuario: string): Observable<any> {
    const params = new HttpParams().set('usuario', usuario);
    return this.http.delete(`${this.baseUrl}/detalle/${idDetalle}`, { params });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductoResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  activo: boolean;
}

export interface ProductoCrearRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
}

export interface ProductoActualizarRequest extends ProductoCrearRequest {}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/productos`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, activo?: boolean | null): Observable<ProductoResponse[]> {
    let params = new HttpParams().set('_ts', Date.now().toString());
    if (q) params = params.set('q', q);
    if (activo !== null && activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<ProductoResponse[]>(this.baseUrl, { params });
  }

  crear(req: ProductoCrearRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.baseUrl, req);
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.baseUrl}/${id}`);
  }

  actualizar(id: number, req: ProductoActualizarRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.baseUrl}/${id}`, req);
  }

  cambiarEstado(id: number, activo: boolean): Observable<ProductoResponse> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.patch<ProductoResponse>(`${this.baseUrl}/${id}/estado`, null, { params });
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}

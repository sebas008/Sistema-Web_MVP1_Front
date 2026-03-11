import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface StockProductoResponse {
  idProducto?: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  stock?: number;
  precio?: number;
  precioUnitario?: number;
}

export interface StockMovimientoRequest {
  idProducto: number;
  cantidad: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  referencia?: string | null;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioRepuestosService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/inventario/repuestos`;

  constructor(private http: HttpClient) {}

  listarStock(q?: string | null): Observable<StockProductoResponse[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<StockProductoResponse[]>(`${this.baseUrl}/stock`, { params });
  }

  aplicarMovimiento(req: StockMovimientoRequest): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/movimiento`, req);
  }
}

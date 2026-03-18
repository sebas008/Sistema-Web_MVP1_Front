import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type CompraResponse = {
  idCompra: number;
  numero: string;
  fecha: string;
  total: number;
  estado: string;
  proveedor?: string | null;
  detalle?: CompraDetalleItem[];
};

export type CompraDetalleItem = {
  item?: number;
  idProducto?: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe?: number;
};

export type CompraRegistrarRequest = {
  serie: string;
  idProveedor: number;
  fechaEmision: string;
  moneda: string;
  afectaStock: boolean;
  detalle: CompraDetalleItem[];
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/contabilidad/compras`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null) {
    let params = new HttpParams().set('_ts', Date.now().toString());
    if (q) params = params.set('q', q);
    return this.http.get<CompraResponse[]>(this.baseUrl, { params });
  }

  obtener(idCompra: number) {
    return this.http.get<CompraResponse>(`${this.baseUrl}/${idCompra}`);
  }

  registrar(req: CompraRegistrarRequest) {
    return this.http.post<CompraResponse>(`${this.baseUrl}/registrar`, req);
  }

  anular(id: number) {
    return this.http.post<CompraResponse>(`${this.baseUrl}/${id}/anular`, {});
  }
}

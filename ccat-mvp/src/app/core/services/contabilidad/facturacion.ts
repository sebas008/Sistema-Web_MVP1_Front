import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type FacturaResponse = {
  idFactura: number;
  numero: string;
  fecha: string;
  total: number;
  estado: string;
  cliente?: string | null;
  detalle?: FacturaDetalleItem[];
};

export type FacturaDetalleItem = {
  item?: number;
  tipo?: string;
  idProducto?: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe?: number;
};

export type FacturaEmitirRequest = {
  serie: string;
  idCliente: number;
  fechaEmision: string;
  moneda: string;
  afectaStock: boolean;
  detalle: FacturaDetalleItem[];
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/contabilidad/facturas`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null) {
    let params = new HttpParams().set('_ts', Date.now().toString());
    if (q) params = params.set('q', q);
    return this.http.get<FacturaResponse[]>(this.baseUrl, { params });
  }

  obtener(idFactura: number) {
    return this.http.get<FacturaResponse>(`${this.baseUrl}/${idFactura}`);
  }

  emitir(req: FacturaEmitirRequest) {
    return this.http.post<FacturaResponse>(`${this.baseUrl}/emitir`, req);
  }

  anular(id: number) {
    return this.http.post<FacturaResponse>(`${this.baseUrl}/${id}/anular`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type FacturaResponse = {
  idFactura: number;
  numero: string;
  fecha: string;      // ISO
  total: number;
  estado: string;     // EMITIDA / ANULADA
  cliente?: string | null;
};

export type FacturaEmitirRequest = {
  idCliente: number;
  fecha?: string | null;   // ISO
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private readonly baseUrl = `${environment.apiBaseUrl}/contabilidad/facturas`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<FacturaResponse[]>(this.baseUrl, { params });
  }

  obtener(idFactura: number) {
    return this.http.get<FacturaResponse>(`${this.baseUrl}/${idFactura}`);
  }

  emitir(req: FacturaEmitirRequest) {
    return this.http.post<FacturaResponse>(`${this.baseUrl}/emitir`, req);
  }
}
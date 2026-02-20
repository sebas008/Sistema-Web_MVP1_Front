import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type GuiaResponse = {
  idGuia: number;
  numero: string;     // GUIA-0001
  fecha: string;      // ISO
  estado: string;     // EMITIDA / ANULADA / PENDIENTE (según tu lógica)
  referencia?: string | null;
  totalItems?: number | null;
  cliente?: string | null;
};

export type GuiaEmitirRequest = {
  idCliente: number;
  fecha?: string | null;
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class GuiasService {
  private readonly baseUrl = `${environment.apiBaseUrl}/contabilidad/guias`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<GuiaResponse[]>(this.baseUrl, { params });
  }

  obtener(idGuia: number) {
    return this.http.get<GuiaResponse>(`${this.baseUrl}/${idGuia}`);
  }

  emitir(req: GuiaEmitirRequest) {
    return this.http.post<GuiaResponse>(`${this.baseUrl}/emitir`, req);
  }
}
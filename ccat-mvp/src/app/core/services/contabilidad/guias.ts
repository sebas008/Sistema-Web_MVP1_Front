import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type GuiaResponse = {
  idGuia: number;
  numero: string;     // GUIA-0001
  fecha: string;      // ISO
  tipo?: string | null;
  estado: string;     // EMITIDA
  motivoTraslado?: string | null;
  puntoPartida?: string | null;
  puntoLlegada?: string | null;
  totalItems?: number | null;
  detalle?: GuiaDetalleItem[];
};

export type GuiaDetalleItem = {
  item?: number;
  tipo?: string; // PRODUCTO / VEHICULO / SERVICIO
  idProducto?: number | null;
  idVehiculo?: number | null;
  descripcion: string;
  cantidad: number;
};

export type GuiaEmitirRequest = {
  serie: string;
  fechaEmision: string; // ISO date
  tipo: string;
  motivoTraslado?: string | null;
  puntoPartida?: string | null;
  puntoLlegada?: string | null;
  afectaStock: boolean;
  detalle: GuiaDetalleItem[];
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class GuiasService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/contabilidad/guias`;

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

  anular(id: number) {
    return this.http.post<GuiaResponse>(`${this.baseUrl}/${id}/anular`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type CompraResponse = {
  idCompra: number;
  numero: string;      // COMP-0001
  fecha: string;       // ISO
  total: number;
  estado: string;      // REGISTRADA / ANULADA
  proveedor?: string | null;
};

export type CompraRegistrarRequest = {
  idProveedor: number;
  fecha?: string | null;
  usuario: string;
};

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly baseUrl = `${environment.apiBaseUrl}/contabilidad/compras`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<CompraResponse[]>(this.baseUrl, { params });
  }

  obtener(idCompra: number) {
    return this.http.get<CompraResponse>(`${this.baseUrl}/${idCompra}`);
  }

  registrar(req: CompraRegistrarRequest) {
    return this.http.post<CompraResponse>(`${this.baseUrl}/registrar`, req);
  }
}
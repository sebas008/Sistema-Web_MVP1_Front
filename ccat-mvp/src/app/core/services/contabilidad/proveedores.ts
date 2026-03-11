import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type ProveedorResponse = {
  idProveedor: number;
  ruc?: string | null;
  razonSocial: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
};

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/contabilidad/proveedores`;

  constructor(private http: HttpClient) {}

  listar(q?: string | null, activo?: boolean | null) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (activo !== null && activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<ProveedorResponse[]>(this.baseUrl, { params });
  }
}

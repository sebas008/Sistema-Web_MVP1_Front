import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type RolResponse = {
  idRol: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
};

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/roles`;
  constructor(private http: HttpClient) {}

  listar(soloActivos: boolean = true) {
    let params = new HttpParams();
    params = params.set('soloActivos', String(soloActivos));
    return this.http.get<RolResponse[]>(this.baseUrl, { params });
  }
}

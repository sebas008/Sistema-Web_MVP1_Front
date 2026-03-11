import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RolResponse {
  idRol: number;
  nombre: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/roles`;

  constructor(private http: HttpClient) {}

  listar(soloActivos?: boolean | null): Observable<RolResponse[]> {
    let params = new HttpParams();
    if (soloActivos !== null && soloActivos !== undefined) params = params.set('soloActivos', String(soloActivos));
    return this.http.get<RolResponse[]>(this.baseUrl, { params });
  }
}

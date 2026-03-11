import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  usuarioId: number;
  username: string;
  nombres: string;
  apellidos: string;
  roles: string[];
}

const SESSION_KEY = 'ccat_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/Auth`;

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, req)
      .pipe(tap((session) => this.setSession(session)));
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  }

  getSession(): LoginResponse | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  /** Username del usuario logueado (si existe sesión). */
  getUsuario(): string | null {
    return this.getSession()?.username ?? null;
  }

  private setSession(session: LoginResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

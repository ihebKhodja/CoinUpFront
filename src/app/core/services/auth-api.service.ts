import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../config/backend.config';
import { AuthResponse, LoginRequest, RegisterRequest } from '../state/auth/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseUrl = buildApiUrl('auth');

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  register(credentials: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, credentials);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

export type UserStatus = 'Active' | 'Suspended' | string;

export interface AdminUserDto {
  id: string;
  email: string;
  username?: string;
  role?: string;
  status?: UserStatus;
  joinedAt?: string;
  createdAt?: string;
  isSuspended?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private readonly baseUrl = buildApiUrl('Users');

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  listUsers(): Observable<AdminUserDto[]> {
    return this.withAuthHeaders((headers) =>
      this.http.get<AdminUserDto[]>(this.baseUrl, { headers })
    );
  }

  setUserActive(userId: string, isActive: boolean): Observable<unknown> {
    return this.withAuthHeaders((headers) =>
      this.http.put(
        `${this.baseUrl}/${encodeURIComponent(userId)}/is-active`,
        { isActive },
        { headers }
      )
    );
  }

  private withAuthHeaders<T>(request: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return this.store.select(selectToken).pipe(
      take(1),
      switchMap((token) => {
        const effectiveToken = token || localStorage.getItem('auth_token');
        let headers = new HttpHeaders();
        if (effectiveToken) {
          headers = headers
            .set('Authorization', `Bearer ${effectiveToken}`)
            .set('auth_token', effectiveToken)
            .set('Content-Type', 'application/json');
        }
        return request(headers);
      })
    );
  }
}

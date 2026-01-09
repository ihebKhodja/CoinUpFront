import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectToken } from '../state/auth/auth.selectors';
import { take, switchMap } from 'rxjs/operators';
import { buildApiUrl } from '../config/backend.config';

export interface Alert {
  id: string;
  coinId: string;
  type: number; // 1 = Price, 2 = Balance, etc.
  abovePrice: number;
  belowPrice: number;
  abovePercentFromBuy: number;
  belowPercentFromBuy: number;
  balanceBelow: number;
  isActive: boolean;
  cooldownMinutes: number;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface CreateAlertDTO {
  coinId: string;
  type: number;
  abovePrice: number;
  belowPrice: number;
  abovePercentFromBuy: number;
  belowPercentFromBuy: number;
  balanceBelow: number;
  isActive: boolean;
  cooldownMinutes: number;
}

export interface UpdateAlertDTO {
  type?: number;
  abovePrice?: number;
  belowPrice?: number;
  abovePercentFromBuy?: number;
  belowPercentFromBuy?: number;
  balanceBelow?: number;
  isActive?: boolean;
  cooldownMinutes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private baseUrl = buildApiUrl('Alerts');

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  /**
   * Get all alerts for the current user
   */
  getAlerts(): Observable<Alert[]> {
    return this.store.select(selectToken).pipe(
      take(1),
      switchMap((token) => {
        const effectiveToken = token || localStorage.getItem('auth_token');
        let headers = new HttpHeaders();
        if (effectiveToken) {
          headers = headers
            .set('Authorization', `Bearer ${effectiveToken}`)
            .set('auth_token', effectiveToken);
        }
        return this.http.get<Alert[]>(this.baseUrl, { headers });
      })
    );
  }

  /**
   * Get alerts for a specific coin
   */
  getAlertsByCoinId(coinId: string): Observable<Alert[]> {
    return this.getAlerts().pipe(
      switchMap((alerts) => {
        return new Observable<Alert[]>(observer => {
          observer.next(alerts.filter(a => a.coinId === coinId));
          observer.complete();
        });
      })
    );
  }

  /**
   * Create a new alert
   */
  createAlert(alertData: CreateAlertDTO): Observable<Alert> {
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
        return this.http.post<Alert>(this.baseUrl, alertData, { headers });
      })
    );
  }

  /**
   * Update an existing alert
   */
  updateAlert(alertId: string, alertData: UpdateAlertDTO): Observable<Alert> {
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
        return this.http.put<Alert>(`${this.baseUrl}/${alertId}`, alertData, { headers });
      })
    );
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string): Observable<{ message: string }> {
    return this.store.select(selectToken).pipe(
      take(1),
      switchMap((token) => {
        const effectiveToken = token || localStorage.getItem('auth_token');
        let headers = new HttpHeaders();
        if (effectiveToken) {
          headers = headers
            .set('Authorization', `Bearer ${effectiveToken}`)
            .set('auth_token', effectiveToken);
        }
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${alertId}`, { headers });
      })
    );
  }

  /**
   * Toggle alert active status
   */
  toggleAlertStatus(alertId: string, isActive: boolean): Observable<Alert> {
    return this.updateAlert(alertId, { isActive });
  }
}

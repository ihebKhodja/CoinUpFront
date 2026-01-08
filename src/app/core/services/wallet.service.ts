import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectToken } from '../state/auth/auth.selectors';
import { switchMap, take } from 'rxjs/operators';
import { buildApiUrl } from '../config/backend.config';

export interface WalletHolding {
  coinId: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentValue: number;
  profit: number;
  lastUpdated: string;
}

export interface WalletResponse {
  walletId: string;
  balance: number;
  holdings: WalletHolding[];
}

export interface WalletTradeRequest {
  coinId: string;
  quantity: number;
}

export interface WalletTradeResponse {
  coinId: string;
  type: 'BUY' | 'SELL' | string;
  quantity: number;
  price: number;
  newBalance: number;
  currentValue: number;
  profit: number;
}

export interface WalletTransaction {
  id: string;
  coinId: string;
  type: string;
  quantity: number;
  priceAtOperation: number;
  timestamp: string;
}

export interface WalletDepositRequest {
  amount: number;
}

export interface WalletDepositResponse {
  message: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly baseUrl = buildApiUrl('wallet');

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  getWallet(): Observable<WalletResponse> {
    return this.withAuthHeaders((headers) => this.http.get<WalletResponse>(this.baseUrl, { headers }));
  }

  buy(payload: WalletTradeRequest): Observable<WalletTradeResponse> {
    return this.withAuthHeaders((headers) =>
      this.http.post<WalletTradeResponse>(`${this.baseUrl}/buy`, payload, { headers })
    );
  }

  sell(payload: WalletTradeRequest): Observable<WalletTradeResponse> {
    return this.withAuthHeaders((headers) =>
      this.http.post<WalletTradeResponse>(`${this.baseUrl}/sell`, payload, { headers })
    );
  }

  getTransactions(): Observable<WalletTransaction[]> {
    return this.withAuthHeaders((headers) =>
      this.http.get<WalletTransaction[]>(`${this.baseUrl}/transactions`, { headers })
    );
  }

  deposit(payload: WalletDepositRequest): Observable<WalletDepositResponse> {
    return this.withAuthHeaders((headers) =>
      this.http.post<WalletDepositResponse>(`${this.baseUrl}/deposit`, payload, { headers })
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

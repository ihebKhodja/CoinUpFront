import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { selectToken } from '../state/auth/auth.selectors';

export interface CoinDetail {
  id: string;
  symbol: string;
  rank: number;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCapChange24h: number;
  marketCapChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
}

export interface MarketChart {
  id: string;
  rank: number;
  days: number;
  prices: [number, number][]; // [timestamp, price]
}

@Injectable({
  providedIn: 'root',
})
export class CoinDetailsService {
  private baseUrl = 'http://localhost:5269/api/Coins';

  constructor(private http: HttpClient, private store: Store) {}

  getCoinDetail(coinId: string): Observable<CoinDetail> {
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

        return this.http.get<CoinDetail>(`${this.baseUrl}/${coinId}`, {
          headers,
        }).pipe(
          catchError((error) => {
            console.error('Error fetching coin detail:', error);
            return throwError(() => new Error('Failed to fetch coin details'));
          })
        );
      })
    );
  }

  getMarketChart(coinId: string, days: number): Observable<MarketChart> {
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

        return this.http
          .get<MarketChart>(
            `${this.baseUrl}/${coinId}/market-chart?days=${days}`,
            { headers }
          )
          .pipe(
            catchError((error) => {
              console.error(`Error fetching market chart for ${days}d:`, error);
              return throwError(
                () => new Error(`Failed to fetch market chart for ${days} days`)
              );
            })
          );
      })
    );
  }
}


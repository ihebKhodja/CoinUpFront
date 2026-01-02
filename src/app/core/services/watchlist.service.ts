import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectToken } from '../state/auth/auth.selectors';
import { take, switchMap } from 'rxjs/operators';

export interface WatchlistItem {
  id: string;
  coinId: string;
  coinName: string;
  symbol: string;
  image: string;
  currentPrice: number;
  addedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private baseUrl = 'http://localhost:5269/api/watchlist';

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  /**
   * Get all watchlist items for the current user
   */
  getWatchlist(): Observable<WatchlistItem[]> {
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
        return this.http.get<WatchlistItem[]>(this.baseUrl, { headers });
      })
    );
  }

  /**
   * Get a specific watchlist item by coin ID
   */
  getWatchlistItem(coinId: string): Observable<WatchlistItem> {
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
        return this.http.get<WatchlistItem>(`${this.baseUrl}/${coinId}`, { headers });
      })
    );
  }

  /**
   * Add a coin to the watchlist
   */
  addToWatchlist(coinId: string): Observable<WatchlistItem> {
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
        return this.http.post<WatchlistItem>(`${this.baseUrl}/${coinId}`, {}, { headers });
      })
    );
  }

  /**
   * Remove a coin from the watchlist
   */
  removeFromWatchlist(coinId: string): Observable<{ message: string }> {
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
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${coinId}`, { headers });
      })
    );
  }

  /**
   * Check if a coin is in the watchlist
   */
  isInWatchlist(coinId: string): Observable<boolean> {
    return this.getWatchlistItem(coinId).pipe(
      switchMap(() => {
        return new Observable<boolean>(observer => {
          observer.next(true);
          observer.complete();
        });
      }),
      switchMap(
        () => new Observable<boolean>(observer => {
          observer.next(true);
          observer.complete();
        })
      )
    );
  }
}

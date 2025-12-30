import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

export interface CoinsListResponse<TItem> {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: TItem[];
}

export interface CoinDto {
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

export interface GetCoinsListParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CoinsListService {
  private readonly baseUrl = `${buildApiUrl('coins')}/`;

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store
  ) {}

  getCoinsList(
    params: GetCoinsListParams = {}
  ): Observable<CoinsListResponse<CoinDto>> {
    let httpParams = new HttpParams();

    if (params.query != null && params.query !== '') {
      httpParams = httpParams.set('query', params.query);
    }

    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }

    if (params.pageSize != null) {
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    }

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

        return this.http.get<CoinsListResponse<CoinDto>>(this.baseUrl, {
          params: httpParams,
          headers,
        });
      })
    );
  }
}

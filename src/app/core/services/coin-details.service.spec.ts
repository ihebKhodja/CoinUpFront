import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { CoinDetailsService } from './coin-details.service';
import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

describe('CoinDetailsService', () => {
  let service: CoinDetailsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoinDetailsService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: null }],
        }),
      ],
    });

    service = TestBed.inject(CoinDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('auth_token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('auth_token');
  });

  it('uses localStorage token when store token is null', () => {
    localStorage.setItem('auth_token', 'LS_TOKEN');

    service.getCoinDetail('bitcoin').subscribe();

    const req = httpMock.expectOne(buildApiUrl('Coins') + '/bitcoin');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer LS_TOKEN');
    expect(req.request.headers.get('auth_token')).toBe('LS_TOKEN');

    req.flush({} as any);
  });

  it('maps coin detail HTTP errors to a friendly Error', (done) => {
    service.getCoinDetail('bitcoin').subscribe({
      next: () => fail('expected error'),
      error: (err) => {
        expect(err instanceof Error).toBeTrue();
        expect((err as Error).message).toBe('Failed to fetch coin details');
        done();
      },
    });

    const req = httpMock.expectOne(buildApiUrl('Coins') + '/bitcoin');
    req.flush('boom', { status: 500, statusText: 'Server Error' });
  });

  it('maps market chart HTTP errors to a friendly Error', (done) => {
    service.getMarketChart('bitcoin').subscribe({
      next: () => fail('expected error'),
      error: (err) => {
        expect(err instanceof Error).toBeTrue();
        expect((err as Error).message).toBe('Failed to fetch market chart');
        done();
      },
    });

    const req = httpMock.expectOne(buildApiUrl('Coins') + '/bitcoin/market-chart');
    req.flush('boom', { status: 500, statusText: 'Server Error' });
  });
});

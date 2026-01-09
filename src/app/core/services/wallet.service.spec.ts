import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { WalletService } from './wallet.service';
import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

describe('WalletService', () => {
  let service: WalletService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WalletService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: 'TEST_TOKEN' }],
        }),
      ],
    });

    service = TestBed.inject(WalletService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getWallet calls GET /wallet with auth headers', () => {
    service.getWallet().subscribe((wallet) => {
      expect(wallet.walletId).toBe('w1');
    });

    const req = httpMock.expectOne(buildApiUrl('wallet'));
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST_TOKEN');
    expect(req.request.headers.get('auth_token')).toBe('TEST_TOKEN');

    req.flush({ walletId: 'w1', balance: 10, holdings: [] });
  });

  it('deposit calls POST /wallet/deposit with body', () => {
    service.deposit({ amount: 50 }).subscribe((res) => {
      expect(res.amount).toBe(50);
    });

    const req = httpMock.expectOne(buildApiUrl('wallet') + '/deposit');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 50 });

    req.flush({ message: 'ok', amount: 50 });
  });

  it('buy calls POST /wallet/buy with body', () => {
    service.buy({ coinId: 'bitcoin', quantity: 1.5 }).subscribe((res) => {
      expect(res.coinId).toBe('bitcoin');
    });

    const req = httpMock.expectOne(buildApiUrl('wallet') + '/buy');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ coinId: 'bitcoin', quantity: 1.5 });
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST_TOKEN');

    req.flush({
      coinId: 'bitcoin',
      type: 'BUY',
      quantity: 1.5,
      price: 100,
      newBalance: 0,
      currentValue: 150,
      profit: 0,
    });
  });

  it('sell calls POST /wallet/sell with body', () => {
    service.sell({ coinId: 'bitcoin', quantity: 0.5 }).subscribe((res) => {
      expect(res.type).toBe('SELL');
    });

    const req = httpMock.expectOne(buildApiUrl('wallet') + '/sell');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ coinId: 'bitcoin', quantity: 0.5 });

    req.flush({
      coinId: 'bitcoin',
      type: 'SELL',
      quantity: 0.5,
      price: 100,
      newBalance: 0,
      currentValue: 50,
      profit: 0,
    });
  });

  it('getTransactions calls GET /wallet/transactions', () => {
    service.getTransactions().subscribe((tx) => {
      expect(tx.length).toBe(1);
    });

    const req = httpMock.expectOne(buildApiUrl('wallet') + '/transactions');
    expect(req.request.method).toBe('GET');

    req.flush([
      {
        id: 't1',
        coinId: 'bitcoin',
        type: 'BUY',
        quantity: 1,
        priceAtOperation: 100,
        timestamp: new Date().toISOString(),
      },
    ]);
  });

  it('falls back to localStorage token when store token is null', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WalletService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: null }],
        }),
      ],
    });

    service = TestBed.inject(WalletService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.setItem('auth_token', 'LS_TOKEN');

    service.getWallet().subscribe();

    const req = httpMock.expectOne(buildApiUrl('wallet'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer LS_TOKEN');
    expect(req.request.headers.get('auth_token')).toBe('LS_TOKEN');

    req.flush({ walletId: 'w1', balance: 0, holdings: [] });
    localStorage.removeItem('auth_token');
  });
});

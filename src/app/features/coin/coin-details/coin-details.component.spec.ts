import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CoinDetailsComponent } from './coin-details.component';
import { CoinDetailsService } from '../../../core/services/coin-details.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { WalletService } from '../../../core/services/wallet.service';

describe('CoinDetailsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 'bitcoin' }) },
        },
        {
          provide: CoinDetailsService,
          useValue: {
            getCoinDetail: () =>
              of({
                id: 'bitcoin',
                symbol: 'btc',
                rank: 1,
                name: 'Bitcoin',
                image: '',
                currentPrice: 100,
                marketCap: 1,
                marketCapRank: 1,
                fullyDilutedValuation: 0,
                totalVolume: 0,
                high24h: 0,
                low24h: 0,
                priceChange24h: 0,
                priceChangePercentage24h: 0,
                marketCapChange24h: 0,
                marketCapChangePercentage24h: 0,
                circulatingSupply: 0,
                totalSupply: 0,
                maxSupply: 0,
                ath: 0,
                athChangePercentage: 0,
                athDate: '',
                atl: 0,
                atlChangePercentage: 0,
                atlDate: '',
                lastUpdated: '',
              }),
            getMarketChart: () => of({ id: 'bitcoin', rank: 1, days: 90, prices: [] }),
          },
        },
        {
          provide: WatchlistService,
          useValue: {
            isInWatchlist: () => of(false),
            addToWatchlist: () => of(void 0),
            removeFromWatchlist: () => of(void 0),
          },
        },
        {
          provide: WalletService,
          useValue: {
            getWallet: () =>
              of({
                walletId: 'w1',
                balance: 0,
                holdings: [
                  {
                    coinId: 'bitcoin',
                    symbol: 'BTC',
                    quantity: 1.2345,
                    averageBuyPrice: 100,
                    currentValue: 12345.67,
                    profit: 0,
                    lastUpdated: '',
                  },
                ],
              }),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders wallet holding quantity and value', fakeAsync(() => {
    const fixture = TestBed.createComponent(CoinDetailsComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const qty = el.querySelector('.balance-amount')?.textContent || '';
    const usd = el.querySelector('.balance-usd')?.textContent || '';

    expect(qty).toContain('1.2345');
    expect(usd).toContain('12,345.67');
  }));

  it('shows "Chart data not available" when chart prices empty', fakeAsync(() => {
    const fixture = TestBed.createComponent(CoinDetailsComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Chart data not available');
  }));

  it('builds chart data when prices exist', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CoinDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ id: 'bitcoin' }) } },
        {
          provide: CoinDetailsService,
          useValue: {
            getCoinDetail: () =>
              of({
                id: 'bitcoin',
                symbol: 'btc',
                rank: 1,
                name: 'Bitcoin',
                image: '',
                currentPrice: 100,
                marketCap: 1,
                marketCapRank: 1,
                fullyDilutedValuation: 0,
                totalVolume: 0,
                high24h: 0,
                low24h: 0,
                priceChange24h: 0,
                priceChangePercentage24h: 0,
                marketCapChange24h: 0,
                marketCapChangePercentage24h: 0,
                circulatingSupply: 0,
                totalSupply: 0,
                maxSupply: 0,
                ath: 0,
                athChangePercentage: 0,
                athDate: '',
                atl: 0,
                atlChangePercentage: 0,
                atlDate: '',
                lastUpdated: '',
              }),
            getMarketChart: () =>
              of({
                id: 'bitcoin',
                rank: 1,
                days: 90,
                prices: [
                  [1700000000000, 100],
                  [1700003600000, 110],
                ],
              }),
          },
        },
        {
          provide: WatchlistService,
          useValue: {
            isInWatchlist: () => of(false),
            addToWatchlist: () => of(void 0),
            removeFromWatchlist: () => of(void 0),
          },
        },
        {
          provide: WalletService,
          useValue: {
            getWallet: () => of({ walletId: 'w1', balance: 0, holdings: [] }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CoinDetailsComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.componentInstance.chartData).toBeTruthy();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain('Chart data not available');
  }));

  it('toggleWatchlist calls add/remove paths and handles error', fakeAsync(() => {
    const addSpy = jasmine.createSpy('addToWatchlist').and.returnValue(of(void 0));
    const removeSpy = jasmine.createSpy('removeFromWatchlist').and.returnValue(of(void 0));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CoinDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ id: 'bitcoin' }) } },
        {
          provide: CoinDetailsService,
          useValue: {
            getCoinDetail: () =>
              of({
                id: 'bitcoin',
                symbol: 'btc',
                rank: 1,
                name: 'Bitcoin',
                image: '',
                currentPrice: 100,
                marketCap: 1,
                marketCapRank: 1,
                fullyDilutedValuation: 0,
                totalVolume: 0,
                high24h: 0,
                low24h: 0,
                priceChange24h: 0,
                priceChangePercentage24h: 0,
                marketCapChange24h: 0,
                marketCapChangePercentage24h: 0,
                circulatingSupply: 0,
                totalSupply: 0,
                maxSupply: 0,
                ath: 0,
                athChangePercentage: 0,
                athDate: '',
                atl: 0,
                atlChangePercentage: 0,
                atlDate: '',
                lastUpdated: '',
              }),
            getMarketChart: () => of({ id: 'bitcoin', rank: 1, days: 90, prices: [] }),
          },
        },
        {
          provide: WatchlistService,
          useValue: {
            isInWatchlist: () => of(false),
            addToWatchlist: addSpy,
            removeFromWatchlist: removeSpy,
          },
        },
        { provide: WalletService, useValue: { getWallet: () => of({ walletId: 'w1', balance: 0, holdings: [] }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CoinDetailsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    // add path
    component.isInWatchlist = false;
    component.toggleWatchlist();
    tick();
    expect(addSpy).toHaveBeenCalledWith('bitcoin');
    expect(component.isInWatchlist).toBeTrue();

    // remove path
    component.isInWatchlist = true;
    component.toggleWatchlist();
    tick();
    expect(removeSpy).toHaveBeenCalledWith('bitcoin');
    expect(component.isInWatchlist).toBeFalse();
  }));
});

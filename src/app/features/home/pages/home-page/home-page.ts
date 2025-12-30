import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ChartModule } from 'primeng/chart';
import { Subject, finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CoinsListService, CoinDto } from '../../../../core/services/coinslist.service';

interface CryptoAsset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume?: string;
  marketCapRank?: number;
  icon: string;
  image?: string;
  trend: 'up' | 'down';
  sparklineData?: any;
}

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputGroupModule,
    InputTextModule,
    AvatarModule,
    AvatarGroupModule,
    ChartModule,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';

  loading = false;
  first = 0;
  page = 1;
  pageSize = 20;
  totalItems = 0;

  sparklineOptions: any = {
    maintainAspectRatio: false,
    responsive: true,
    animation: false,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 0,
      },
      line: {
        tension: 0.35,
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  private readonly upColor = this.readCssVar('--primary-color') || '#3b82f6';
  private readonly downColor = 'rgba(239, 68, 68, 0.95)';

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  assets: CryptoAsset[] = [];

  constructor(private readonly coinsListService: CoinsListService) {}

  ngOnInit() {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.first = 0;
        this.page = 1;
        this.loadAssets();
      });

    this.loadAssets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.search$.next(value ?? '');
  }

  onLazyLoad(event: any): void {
    const nextFirst = Number(event?.first ?? 0);
    const nextRows = Number(event?.rows ?? this.pageSize);

    this.first = nextFirst;
    if (nextRows > 0) {
      this.pageSize = nextRows;
      this.page = Math.floor(this.first / this.pageSize) + 1;
    }

    this.loadAssets();
  }

  private loadAssets(): void {
    this.loading = true;
    this.coinsListService
      .getCoinsList({
        query: this.searchQuery,
        page: this.page,
        pageSize: this.pageSize,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.totalItems = res.totalItems ?? 0;
          this.assets = (res.items ?? []).map((coin) => this.mapCoinToAsset(coin));

          // Keep paginator aligned with our requested page/pageSize.
          this.first = Math.max(0, (this.page - 1) * this.pageSize);
        },
        error: () => {
          this.totalItems = 0;
          this.assets = [];
        },
      });
  }

  private mapCoinToAsset(coin: CoinDto): CryptoAsset {
    const change24h = Number(coin?.priceChangePercentage24h ?? 0);
    return {
      id: coin?.id,
      name: coin?.name ?? '',
      symbol: (coin?.symbol ?? '').toUpperCase(),
      price: Number(coin?.currentPrice ?? 0),
      change24h,
      marketCap: this.formatCurrencyShort(coin?.marketCap ?? 0),
      volume: this.formatCurrencyShort(coin?.totalVolume ?? 0),
      marketCapRank: coin?.marketCapRank,
      icon: (coin?.symbol ?? '?').slice(0, 1).toUpperCase(),
      image: coin?.image || undefined,
      trend: change24h >= 0 ? 'up' : 'down',
      sparklineData: this.buildSparklineData(coin, change24h),
    };
  }

  private buildSparklineData(coin: CoinDto, changePct24h: number): any | undefined {
    const current = Number(coin?.currentPrice);
    const deltaAbs = Number(coin?.priceChange24h);
    const prev = this.isFiniteNumber(current) && this.isFiniteNumber(deltaAbs) ? current - deltaAbs : undefined;

    const low = Number(coin?.low24h);
    const high = Number(coin?.high24h);

    // Prefer 24h range for a readable sparkline.
    const hasRange = this.isFinitePositive(low) && this.isFinitePositive(high) && high > low;
    const baseMin = hasRange ? low : (this.isFinitePositive(prev) ? Math.min(prev!, current) : current * 0.995);
    const baseMax = hasRange ? high : (this.isFinitePositive(prev) ? Math.max(prev!, current) : current * 1.005);

    if (!this.isFiniteNumber(current) || current <= 0) return undefined;

    let min = baseMin;
    let max = baseMax;
    if (!this.isFiniteNumber(min) || !this.isFiniteNumber(max) || min <= 0 || max <= 0 || min === max) {
      min = current * 0.995;
      max = current * 1.005;
    }

    const range = Math.max(max - min, current * 0.001);
    const seed = this.hashStringToUnit(coin?.id || coin?.symbol || coin?.name || 'coin');
    const noise = (i: number) => (this.hashStringToUnit(`${seed}:${i}`) - 0.5) * 0.18 * range;

    // Build 7 points: prev -> drift -> low -> current -> drift -> high -> settle
    const p0 = this.isFinitePositive(prev) ? prev! : current - (changePct24h / 100) * current;
    const p1 = p0 + (current - p0) * 0.35 + noise(1);
    const p2 = hasRange ? low + range * 0.15 + noise(2) : p1 + noise(2);
    const p3 = current + noise(3);
    const p4 = p3 + (hasRange ? range * 0.25 : range * 0.15) + noise(4);
    const p5 = hasRange ? high - range * 0.15 + noise(5) : p4 + noise(5);
    const p6 = p3 + (p3 - p0) * 0.15 + noise(6);

    const points = [p0, p1, p2, p3, p4, p5, p6].map((v) => this.clamp(v, min, max));
    const color = changePct24h >= 0 ? this.upColor : this.downColor;

    return {
      labels: ['1', '2', '3', '4', '5', '6', '7'],
      datasets: [
        {
          data: points,
          fill: false,
          borderColor: color,
          backgroundColor: color,
        },
      ],
    };
  }

  private clamp(value: number, min: number, max: number): number {
    if (!this.isFiniteNumber(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  private isFinitePositive(value: unknown): value is number {
    return this.isFiniteNumber(value) && value > 0;
  }

  private readCssVar(name: string): string {
    try {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    } catch {
      return '';
    }
  }

  private hashStringToUnit(input: string): number {
    // Deterministic hash in [0,1)
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
  }

  private formatCurrencyShort(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${Number(value).toLocaleString()}`;
  }

  onTrade(asset: CryptoAsset) {
    console.log('Trade clicked for', asset.name);
  }

  onCopyInvite() {
    const inviteLink = 'https://coinupfront.com/invite/abc123xyz';
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    });
  }
}


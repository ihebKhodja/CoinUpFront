import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { Subject, takeUntil } from 'rxjs';
import { CoinDetailsService, CoinDetail, MarketChart } from '../../../core/services/coin-details.service';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
  selector: 'app-coin-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ChartModule],
  templateUrl: './coin-details.component.html',
  styleUrl: './coin-details.component.scss',
})
export class CoinDetailsComponent implements OnInit, OnDestroy {
  coinId: string = '';
  coinDetail: CoinDetail | null = null;
  marketChart1d: MarketChart | null = null;
  marketChart7d: MarketChart | null = null;
  loading = true;
  error: string | null = null;
  selectedChart: '1d' | '7d' = '1d';
  chartData: any = null;
  chartOptions: any = null;
  isInWatchlist = false;
  watchlistLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coinDetailsService: CoinDetailsService,
    private watchlistService: WatchlistService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.coinId = params['id'];
        this.loadCoinDetails();
        this.checkIfInWatchlist();
      });
  }

  checkIfInWatchlist(): void {
    this.watchlistService.isInWatchlist(this.coinId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isInWatchlist) => {
          this.isInWatchlist = isInWatchlist;
        },
        error: () => {
          this.isInWatchlist = false;
        }
      });
  }

  toggleWatchlist(): void {
    this.watchlistLoading = true;

    if (this.isInWatchlist) {
      this.watchlistService.removeFromWatchlist(this.coinId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isInWatchlist = false;
            this.watchlistLoading = false;
          },
          error: (err) => {
            console.error('Failed to remove from watchlist:', err);
            this.watchlistLoading = false;
          }
        });
    } else {
      this.watchlistService.addToWatchlist(this.coinId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isInWatchlist = true;
            this.watchlistLoading = false;
          },
          error: (err) => {
            console.error('Failed to add to watchlist:', err);
            this.watchlistLoading = false;
          }
        });
    }
  }

  loadCoinDetails(): void {
    this.loading = true;
    this.error = null;

    this.coinDetailsService
      .getCoinDetail(this.coinId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.coinDetail = detail;
          this.loadMarketCharts();
        },
        error: (err) => {
          this.error = 'Failed to load coin details';
          this.loading = false;
          console.error('Error loading coin detail:', err);
        },
      });
  }

  loadMarketCharts(): void {
    // Load 1 day chart
    this.coinDetailsService
      .getMarketChart(this.coinId, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chart) => {
          this.marketChart1d = chart;
          if (this.selectedChart === '1d') {
            this.updateChart();
          }
        },
        error: (err) => {
          console.error('Error loading 1d chart:', err);
        },
      });

    // Load 7 days chart
    this.coinDetailsService
      .getMarketChart(this.coinId, 7)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chart) => {
          this.marketChart7d = chart;
          if (this.selectedChart === '7d') {
            this.updateChart();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading 7d chart:', err);
          this.loading = false;
        },
      });
  }

  selectChart(period: '1d' | '7d'): void {
    this.selectedChart = period;
    this.updateChart();
  }

  updateChart(): void {
    const chart =
      this.selectedChart === '1d' ? this.marketChart1d : this.marketChart7d;

    if (!chart || !chart.prices || chart.prices.length === 0) {
      this.chartData = null;
      return;
    }

    const prices = chart.prices.map((p) => p[1]);
    const labels = chart.prices.map((p) => {
      const date = new Date(p[0]);
      return this.selectedChart === '1d'
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Price (USD)',
          data: prices,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
        },
      ],
    };

    if (!this.chartOptions) {
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          filler: {
            propagate: true,
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(71, 85, 105, 0.2)',
              drawBorder: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 10,
              },
            },
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(71, 85, 105, 0.2)',
              drawBorder: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 10,
              },
              callback: (value: any) => {
                return '$' + value.toLocaleString();
              },
            },
          },
        },
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

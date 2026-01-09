import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  WalletResponse,
  WalletService,
  WalletTradeRequest,
  WalletTransaction
} from '../../core/services/wallet.service';

type TradeMode = 'BUY' | 'SELL';
type ToastKind = 'success' | 'error';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent implements OnInit, OnDestroy {
  wallet: WalletResponse | null = null;
  transactions: WalletTransaction[] = [];
  loading = false;
  error: string | null = null;

  showTradeModal = false;
  tradeMode: TradeMode = 'BUY';
  tradeForm: WalletTradeRequest = { coinId: '', quantity: 0 };
  tradeSaving = false;

  toast: { kind: ToastKind; message: string } | null = null;

  private readonly destroy$ = new Subject<void>();
  private toastTimer: any;

  constructor(private readonly walletService: WalletService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  refreshAll(): void {
    this.loading = true;
    this.error = null;

    this.walletService
      .getWallet()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (wallet: WalletResponse) => {
          this.wallet = wallet;
          this.loadTransactions();
        },
        error: (err: any) => {
          console.error('Wallet load error:', err);
          this.error = 'Failed to load wallet.';
        }
      });
  }

  loadTransactions(): void {
    this.walletService
      .getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (txs: WalletTransaction[]) => {
          this.transactions = [...txs].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        },
        error: (err: any) => {
          console.error('Transactions load error:', err);
        }
      });
  }

  openTrade(mode: TradeMode, coinId?: string): void {
    this.tradeMode = mode;
    this.tradeSaving = false;
    this.tradeForm = {
      coinId: coinId || '',
      quantity: 0
    };
    this.showTradeModal = true;
  }

  closeTrade(): void {
    this.showTradeModal = false;
  }

  submitTrade(): void {
    if (!this.tradeForm.coinId || !this.tradeForm.quantity || this.tradeForm.quantity <= 0) {
      this.showToast('error', 'Please provide coinId and a valid quantity.');
      return;
    }

    this.tradeSaving = true;
    this.error = null;

    const request$ =
      this.tradeMode === 'BUY'
        ? this.walletService.buy(this.tradeForm)
        : this.walletService.sell(this.tradeForm);

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.tradeSaving = false;
        })
      )
      .subscribe({
        next: (res) => {
          const verb = this.tradeMode === 'BUY' ? 'Bought' : 'Sold';
          this.showToast('success', `${verb} ${res.quantity} ${res.coinId.toUpperCase()} successfully.`);
          this.closeTrade();
          this.refreshAll();
        },
        error: (err: any) => {
          console.error('Trade error:', err);

          if (this.tradeMode === 'BUY') {
            // Show a specific popup when balance is not enough
            const serverMessage =
              err?.error?.message ||
              err?.error?.title ||
              (typeof err?.error === 'string' ? err.error : null) ||
              null;

            if (err?.status === 400 || err?.status === 409) {
              this.showToast('error', serverMessage || 'Not enough balance to complete this buy.');
              return;
            }
          }

          this.showToast('error', 'Operation failed. Please try again.');
        }
      });
  }

  formatMoney(value: number | null | undefined): string {
    const amount = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatNumber(value: number | null | undefined, maxDecimals = 8): string {
    const amount = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals
    }).format(amount);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showToast(kind: ToastKind, message: string): void {
    this.toast = { kind, message };
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, 3500);
  }
}

import { CommonModule, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { WalletDepositResponse, WalletResponse, WalletService } from '../../../core/services/wallet.service';

type PaymentMethod = 'BANK_TRANSFER' | 'INSTANT_CARD' | 'WIRE_TRANSFER';

type ToastKind = 'success' | 'error';

@Component({
  selector: 'app-deposit-funds',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, RouterLink],
  templateUrl: './deposit-funds.component.html',
  styleUrl: './deposit-funds.component.scss'
})
export class DepositFundsComponent implements OnInit, OnDestroy {
  wallet: WalletResponse | null = null;

  selectedMethod: PaymentMethod = 'BANK_TRANSFER';
  currency = 'USD';
  amount = 500;

  readonly minDeposit = 50;
  readonly maxDeposit = 50000;

  referenceCode = this.generateReferenceCode();

  loading = false;
  saving = false;

  toast: { kind: ToastKind; message: string } | null = null;
  private toastTimer: any;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly walletService: WalletService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  loadWallet(): void {
    this.loading = true;
    this.walletService
      .getWallet()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (wallet) => {
          this.wallet = wallet;
        },
        error: (err) => {
          console.error('Deposit wallet load error:', err);
          this.showToast('error', 'Failed to load wallet balance.');
        }
      });
  }

  setMax(): void {
    this.amount = this.maxDeposit;
  }

  submitDeposit(): void {
    const numericAmount = Number(this.amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      this.showToast('error', 'Please enter a valid deposit amount.');
      return;
    }

    if (numericAmount < this.minDeposit) {
      this.showToast('error', `Min deposit: ${this.formatMoney(this.minDeposit)}.`);
      return;
    }

    if (numericAmount > this.maxDeposit) {
      this.showToast('error', `Max deposit: ${this.formatMoney(this.maxDeposit)}.`);
      return;
    }

    this.saving = true;

    this.walletService
      .deposit({ amount: numericAmount })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (res: WalletDepositResponse) => {
          this.showToast('success', res?.message || 'Deposit successful.');
          this.loadWallet();
        },
        error: (err: any) => {
          console.error('Deposit error:', err);
          const serverMessage =
            err?.error?.message ||
            err?.error?.title ||
            (typeof err?.error === 'string' ? err.error : null) ||
            null;
          this.showToast('error', serverMessage || 'Deposit failed. Please try again.');
        }
      });
  }

  methodLabel(method: PaymentMethod): string {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'INSTANT_CARD':
        return 'Instant Card';
      case 'WIRE_TRANSFER':
        return 'Wire Transfer';
    }
  }

  methodIcon(method: PaymentMethod): string {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'pi pi-building';
      case 'INSTANT_CARD':
        return 'pi pi-credit-card';
      case 'WIRE_TRANSFER':
        return 'pi pi-arrow-right-arrow-left';
    }
  }

  methodFee(method: PaymentMethod): string {
    switch (method) {
      case 'BANK_TRANSFER':
        return '1-3 days • 0% fee';
      case 'INSTANT_CARD':
        return 'Instant • 2.5% fee';
      case 'WIRE_TRANSFER':
        return '1-5 days • $15 fee';
    }
  }

  get summaryFeeLabel(): string {
    if (this.selectedMethod === 'BANK_TRANSFER') {
      return 'Free';
    }
    if (this.selectedMethod === 'INSTANT_CARD') {
      return '2.5%';
    }
    return '$15';
  }

  get summaryTimeLabel(): string {
    if (this.selectedMethod === 'BANK_TRANSFER') {
      return '1-3 Days';
    }
    if (this.selectedMethod === 'INSTANT_CARD') {
      return 'Instant';
    }
    return '1-5 Days';
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('success', 'Copied to clipboard.');
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      this.showToast('error', 'Copy failed.');
    }
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

  private showToast(kind: ToastKind, message: string): void {
    this.toast = { kind, message };
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, 3500);
  }

  private generateReferenceCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '0123456789';

    const part = (len: number, pool: string) =>
      Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join('');

    return `CW-${part(4, digits)}-${part(2, alphabet)}${part(2, digits)}`;
  }
}

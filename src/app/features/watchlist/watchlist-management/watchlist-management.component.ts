import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistService, WatchlistItem } from '../../../core/services/watchlist.service';
import { AlertsService, Alert, CreateAlertDTO, UpdateAlertDTO } from '../../../core/services/alerts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-watchlist-management',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './watchlist-management.component.html',
  styleUrls: ['./watchlist-management.component.scss']
})
export class WatchlistManagementComponent implements OnInit, OnDestroy {
  watchlistItems: WatchlistItem[] = [];
  alerts: Alert[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  selectedCoinId: string | null = null;
  showAlertModal = false;
  alertSaving = false;
  editingAlertId: string | null = null;
  alertForm: CreateAlertDTO = {
    coinId: '',
    type: 1,
    abovePrice: 0,
    belowPrice: 0,
    abovePercentFromBuy: 0,
    belowPercentFromBuy: 0,
    balanceBelow: 0,
    isActive: true,
    cooldownMinutes: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private watchlistService: WatchlistService,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.loadWatchlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user's watchlist
   */
  loadWatchlist(): void {
    this.loading = true;
    this.error = null;

    this.watchlistService.getWatchlist()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: WatchlistItem[]) => {
          this.watchlistItems = items;
          this.loading = false;
          this.loadAlerts();
        },
        error: (err: any) => {
          this.error = 'Failed to load watchlist';
          this.loading = false;
          console.error('Watchlist load error:', err);
        }
      });
  }

  /**
   * Load all alerts for watchlist coins
   */
  loadAlerts(): void {
    this.alertsService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alerts: Alert[]) => {
          this.alerts = alerts;
        },
        error: (err: any) => {
          console.error('Alerts load error:', err);
        }
      });
  }

  /**
   * Open alert configuration modal for a coin
   */
  openAlertModal(item: WatchlistItem): void {
    this.selectedCoinId = item.coinId;
    this.editingAlertId = null;
    this.alertSaving = false;
    this.alertForm = {
      coinId: item.coinId,
      type: 1,
      abovePrice: 0,
      belowPrice: 0,
      abovePercentFromBuy: 0,
      belowPercentFromBuy: 0,
      balanceBelow: 0,
      isActive: true,
      cooldownMinutes: 0
    };
    this.showAlertModal = true;
  }

  /**
   * Close alert configuration modal
   */
  closeAlertModal(): void {
    this.showAlertModal = false;
    this.selectedCoinId = null;
    this.editingAlertId = null;
    this.alertSaving = false;
  }

  /**
   * Start editing an existing alert
   */
  editAlert(alert: Alert): void {
    this.selectedCoinId = alert.coinId;
    this.editingAlertId = alert.id;
    this.alertForm = {
      coinId: alert.coinId,
      type: alert.type,
      abovePrice: alert.abovePrice,
      belowPrice: alert.belowPrice,
      abovePercentFromBuy: alert.abovePercentFromBuy,
      belowPercentFromBuy: alert.belowPercentFromBuy,
      balanceBelow: alert.balanceBelow,
      isActive: alert.isActive,
      cooldownMinutes: alert.cooldownMinutes
    };
    this.showAlertModal = true;
  }

  /**
   * Reset the form to create a new alert for the selected coin
   */
  startNewAlert(): void {
    if (!this.selectedCoinId) return;
    this.editingAlertId = null;
    this.alertForm = {
      coinId: this.selectedCoinId,
      type: 1,
      abovePrice: 0,
      belowPrice: 0,
      abovePercentFromBuy: 0,
      belowPercentFromBuy: 0,
      balanceBelow: 0,
      isActive: true,
      cooldownMinutes: 0
    };
  }

  /**
   * Save alert (POST when creating, PUT when editing)
   */
  saveAlert(): void {
    if (!this.alertForm.coinId) {
      this.error = 'Missing coinId for alert.';
      return;
    }

    this.alertSaving = true;
    this.error = null;

    if (this.editingAlertId) {
      const updateDto: UpdateAlertDTO = {
        type: this.alertForm.type,
        abovePrice: this.alertForm.abovePrice,
        belowPrice: this.alertForm.belowPrice,
        abovePercentFromBuy: this.alertForm.abovePercentFromBuy,
        belowPercentFromBuy: this.alertForm.belowPercentFromBuy,
        balanceBelow: this.alertForm.balanceBelow,
        isActive: this.alertForm.isActive,
        cooldownMinutes: this.alertForm.cooldownMinutes
      };

      this.alertsService.updateAlert(this.editingAlertId, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated: Alert) => {
            const index = this.alerts.findIndex(a => a.id === updated.id);
            if (index !== -1) {
              this.alerts[index] = updated;
            } else {
              this.alerts = [updated, ...this.alerts];
            }
            this.alertSaving = false;
          },
          error: (err: any) => {
            this.error = 'Failed to update alert.';
            this.alertSaving = false;
            console.error('Update alert error:', err);
          }
        });
    } else {
      this.alertsService.createAlert(this.alertForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (created: Alert) => {
            this.alerts = [created, ...this.alerts];
            this.alertSaving = false;
            this.startNewAlert();
          },
          error: (err: any) => {
            this.error = 'Failed to create alert.';
            this.alertSaving = false;
            console.error('Create alert error:', err);
          }
        });
    }
  }

  /**
   * Delete an alert (from modal list)
   */
  deleteAlertFromModal(alertId: string): void {
    this.deleteAlert(alertId);
    if (this.editingAlertId === alertId) {
      this.startNewAlert();
    }
  }

  /**
   * Friendly label for alert type
   */
  getAlertTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'Price';
      case 2:
        return 'Balance';
      default:
        return `Type ${type}`;
    }
  }

  /**
   * Remove coin from watchlist
   */
  removeFromWatchlist(coinId: string, coinName: string): void {
    if (confirm(`Remove ${coinName} from watchlist?`)) {
      this.watchlistService.removeFromWatchlist(coinId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.watchlistItems = this.watchlistItems.filter(item => item.coinId !== coinId);
            // Also remove associated alerts
            this.alerts = this.alerts.filter(alert => alert.coinId !== coinId);
          },
          error: (err: any) => {
            this.error = `Failed to remove ${coinName} from watchlist`;
            console.error('Remove error:', err);
          }
        });
    }
  }

  /**
   * Get alerts for a specific coin
   */
  getCoinAlerts(coinId: string): Alert[] {
    return this.alerts.filter(alert => alert.coinId === coinId);
  }

  /**
   * Toggle alert active status
   */
  toggleAlertStatus(alert: Alert): void {
    this.alertsService.toggleAlertStatus(alert.id, !alert.isActive)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedAlert: Alert) => {
          const index = this.alerts.findIndex(a => a.id === alert.id);
          if (index !== -1) {
            this.alerts[index] = updatedAlert;
          }
        },
        error: (err: any) => {
          this.error = 'Failed to update alert status';
          console.error('Alert toggle error:', err);
        }
      });
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string): void {
    if (confirm('Delete this alert?')) {
      this.alertsService.deleteAlert(alertId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.alerts = this.alerts.filter(a => a.id !== alertId);
          },
          error: (err: any) => {
            this.error = 'Failed to delete alert';
            console.error('Delete alert error:', err);
          }
        });
    }
  }

  /**
   * Filter watchlist by search query
   */
  get filteredWatchlist(): WatchlistItem[] {
    if (!this.searchQuery.trim()) {
      return this.watchlistItems;
    }
    const query = this.searchQuery.toLowerCase();
    return this.watchlistItems.filter(item =>
      item.coinName.toLowerCase().includes(query) ||
      item.symbol.toLowerCase().includes(query)
    );
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

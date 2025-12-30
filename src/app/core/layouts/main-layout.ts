import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  menuItems = [
    { icon: 'pi pi-home', label: 'Dashboard', route: '/home' },
    { icon: 'pi pi-wallet', label: 'Wallet', route: '/wallet' },
    { icon: 'pi pi-arrow-right-arrow-left', label: 'Exchange', route: '/exchange' },
    { icon: 'pi pi-chart-line', label: 'Activity', route: '/activity' }
  ];
}

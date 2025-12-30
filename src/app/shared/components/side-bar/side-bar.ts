import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBarComponent {
  isSidebarOpen = true;

  menuItems: MenuItem[] = [
    { icon: 'pi pi-home', label: 'Dashboard', route: '/home' },
    { icon: 'pi pi-wallet', label: 'Wallet', route: '/wallet' },
    { icon: 'pi pi-arrow-right-arrow-left', label: 'Exchange', route: '/exchange' },
    { icon: 'pi pi-chart-line', label: 'Activity', route: '/activity' }
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}

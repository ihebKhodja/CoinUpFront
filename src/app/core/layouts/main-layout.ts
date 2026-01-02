import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  userName$: Observable<string>;
  userInitial$: Observable<string>;

  menuItems = [
    { icon: 'pi pi-home', label: 'Dashboard', route: '/home' },
    { icon: 'pi pi-wallet', label: 'Wallet', route: '/wallet' },
    { icon: 'pi pi-star', label: 'Watchlist', route: '/watchlist' },
    // { icon: 'pi pi-arrow-right-arrow-left', label: 'Exchange', route: '/exchange' },
    // { icon: 'pi pi-chart-line', label: 'Activity', route: '/activity' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.userName$ = this.authService.user$.pipe(
      map(user => user?.username || 'User')
    );
    
    this.userInitial$ = this.authService.user$.pipe(
      map(user => {
        const name = user?.username || 'User';
        return name.charAt(0).toUpperCase();
      })
    );
  }

  ngOnInit(): void {
    // Initialize user data if needed
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout() {
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset auth state
    this.authService.logout();
    
    // Navigate to login
    this.router.navigate(['/login']);
  }
}

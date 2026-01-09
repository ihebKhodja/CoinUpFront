import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login-component/login-component';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { HomeComponent } from './features/home/pages/home-page/home-page';
import { CoinDetailsComponent } from './features/coin/coin-details/coin-details.component';
import { WatchlistManagementComponent } from './features/watchlist/watchlist-management/watchlist-management.component';
import { WalletComponent } from './features/wallet/wallet.component';
import { DepositFundsComponent } from './features/wallet/deposit-funds/deposit-funds.component';
import { MainLayoutComponent } from './core/layouts/main-layout';
import { AuthGuard, PublicGuard, AdminGuard } from './core/guards/auth.guards';
import { AdminUsersListComponent } from './features/admin/users-list/users-list.component';

export const routes: Routes = [
    {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
    },
    {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard]
    },
    {
    path: 'register',
    component: RegisterComponent,
    canActivate: [PublicGuard]
    },
    {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
        {
        path: 'home',
        component: HomeComponent
        },
        {
        path: 'admin/users',
        component: AdminUsersListComponent,
        canActivate: [AdminGuard]
        },
        {
        path: 'wallet',
        component: WalletComponent
        },
        {
        path: 'wallet/deposit',
        component: DepositFundsComponent
        },
        {
        path: 'coin/:id',
        component: CoinDetailsComponent
        },
        {
        path: 'watchlist',
        component: WatchlistManagementComponent
        },
        // {
        // path: 'exchange',
        // component: ExchangeComponent
        // },
        // {
        // path: 'activity',
        // component: ActivityComponent
        // },
    ]
    },
];
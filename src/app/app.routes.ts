import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login-component/login-component';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { HomeComponent } from './features/home/pages/home-page/home-page';
import { MainLayoutComponent } from './core/layouts/main-layout';
import { AuthGuard, PublicGuard } from './core/guards/auth.guards';

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
        // {
        // path: 'wallet',
        // component: WalletComponent
        // },
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
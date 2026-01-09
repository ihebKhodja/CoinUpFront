import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../state/auth/auth.actions';
import { selectIsAuthenticated, selectUser, selectToken, selectAuthError, selectAuthLoading } from '../state/auth/auth.selectors';
import { LoginRequest, RegisterRequest, User } from '../state/auth/auth.model';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { isAdminToken } from '../utils/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated$!: Observable<boolean>;
  user$!: Observable<User | null>;
  token$!: Observable<string | null>;
  isAdmin$!: Observable<boolean>;
  error$!: Observable<string | null>;
  loading$!: Observable<boolean>;

  constructor(private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectUser);
    this.token$ = this.store.select(selectToken);
    this.isAdmin$ = this.token$.pipe(
      map((token) => token || localStorage.getItem('auth_token')),
      map((token) => isAdminToken(token)),
      distinctUntilChanged()
    );
    this.error$ = this.store.select(selectAuthError);
    this.loading$ = this.store.select(selectAuthLoading);

    // Initialize auth state on app startup
    this.store.dispatch(AuthActions.initAuth());
  }


  login(credentials: LoginRequest): void {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  register(credentials: RegisterRequest): void {
    this.store.dispatch(AuthActions.register({ credentials }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  clearError(): void {
    this.store.dispatch(AuthActions.clearError());
  }
}

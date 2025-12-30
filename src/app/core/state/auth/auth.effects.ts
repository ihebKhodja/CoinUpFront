import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as AuthActions from './auth.actions';
import { AuthApiService } from '../../services/auth-api.service';
import { log } from 'node:console';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authApi.login(credentials).pipe(
          map((response) => {
            console.log('Login response:', response);
            if (response.token) {
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('user', JSON.stringify(response?.username));
            }
            return AuthActions.loginSuccess({ response });
          }),
          tap(() => this.router.navigate(['/home'])),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.error?.message || 'Login failed' }))
          )
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ credentials }) =>
        this.authApi.register(credentials).pipe(
          map((response) => {
            console.log('Registration response:', response);
            if (response.token) {
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('user', JSON.stringify(response?.username));
            }
            return AuthActions.registerSuccess({ response });
          }),
          tap(() => this.router.navigate(['/home'])),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.error?.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }),
      map(() => AuthActions.logoutSuccess()),
      tap(() => this.router.navigate(['/login']))
    )
  );

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      switchMap(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return of(AuthActions.initAuthSuccess({ user, token }));
          } catch {
            return of(AuthActions.initAuthFailure());
          }
        }
        return of(AuthActions.initAuthFailure());
      })
    )
  );
}

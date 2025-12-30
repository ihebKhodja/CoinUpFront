import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  UrlSegment,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../state/auth/auth.selectors';
import * as AuthActions from '../state/auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) return true;

        const token = localStorage.getItem('auth_token');
        if (token) {
          // Best-effort: sync localStorage auth into store.
          this.store.dispatch(AuthActions.initAuth());
          return true;
        }

        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
      })
    );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.canActivate(route, state);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) return true;

        const token = localStorage.getItem('auth_token');
        if (token) {
          this.store.dispatch(AuthActions.initAuth());
          return true;
        }

        return this.router.createUrlTree(['/login']);
      })
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuthenticated) => {
        const token = localStorage.getItem('auth_token');
        if (isAuthenticated || token) {
          if (token) {
            this.store.dispatch(AuthActions.initAuth());
          }
          return this.router.createUrlTree(['/home']);
        }
        return true;
      })
    );
  }
}

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { AdminGuard } from './auth.guards';
import { selectIsAuthenticated } from '../state/auth/auth.selectors';

function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function makeToken(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        provideMockStore({
          selectors: [{ selector: selectIsAuthenticated, value: true }],
        }),
      ],
    }).compileComponents();

    guard = TestBed.inject(AdminGuard);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.removeItem('auth_token');
  });

  it('allows navigation when token is admin', (done) => {
    localStorage.setItem('auth_token', makeToken({ role: 'Admin' }));

    guard
      .canActivate({} as any, { url: '/admin/users' } as any)
      .subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
  });

  it('redirects to /home when token is not admin', (done) => {
    localStorage.setItem('auth_token', makeToken({ role: 'User' }));

    guard
      .canActivate({} as any, { url: '/admin/users' } as any)
      .subscribe((result) => {
        expect(result instanceof UrlTree).toBeTrue();
        const url = router.serializeUrl(result as UrlTree);
        expect(url).toBe('/home');
        done();
      });
  });

  it('redirects to /home when token missing', (done) => {
    localStorage.removeItem('auth_token');

    guard
      .canActivate({} as any, { url: '/admin/users' } as any)
      .subscribe((result) => {
        expect(result instanceof UrlTree).toBeTrue();
        const url = router.serializeUrl(result as UrlTree);
        expect(url).toBe('/home');
        done();
      });
  });
});

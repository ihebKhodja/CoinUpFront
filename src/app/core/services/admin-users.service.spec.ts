import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { AdminUsersService } from './admin-users.service';
import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminUsersService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: 'TEST_TOKEN' }],
        }),
      ],
    });

    service = TestBed.inject(AdminUsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('listUsers calls GET /Users with auth headers', () => {
    service.listUsers().subscribe((users) => {
      expect(users).toEqual([]);
    });

    const req = httpMock.expectOne(buildApiUrl('Users'));
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST_TOKEN');
    expect(req.request.headers.get('auth_token')).toBe('TEST_TOKEN');

    req.flush([]);
  });

  it('setUserActive calls PUT /Users/{id}/is-active with body', () => {
    service.setUserActive('abc 123', true).subscribe();

    const req = httpMock.expectOne(buildApiUrl('Users') + '/abc%20123/is-active');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ isActive: true });
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST_TOKEN');

    req.flush({ ok: true });
  });
});

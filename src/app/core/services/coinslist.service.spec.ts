import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { CoinsListService } from './coinslist.service';
import { buildApiUrl } from '../config/backend.config';
import { selectToken } from '../state/auth/auth.selectors';

describe('CoinsListService', () => {
  let service: CoinsListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoinsListService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: 'TEST_TOKEN' }],
        }),
      ],
    });

    service = TestBed.inject(CoinsListService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('auth_token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('auth_token');
  });

  it('builds query params (query/page/pageSize) and sets auth headers', () => {
    service.getCoinsList({ query: 'btc', page: 2, pageSize: 50 }).subscribe((res) => {
      expect(res.items).toEqual([]);
    });

    const req = httpMock.expectOne((r) => {
      return (
        r.url === buildApiUrl('coins') + '/' &&
        r.params.get('query') === 'btc' &&
        r.params.get('page') === '2' &&
        r.params.get('pageSize') === '50'
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST_TOKEN');
    expect(req.request.headers.get('auth_token')).toBe('TEST_TOKEN');

    req.flush({ totalItems: 0, page: 2, pageSize: 50, totalPages: 0, items: [] });
  });

  it('does not add Authorization header when no token exists', () => {
    // Override selector value for this spec by setting localStorage & selector empty.
    localStorage.removeItem('auth_token');

    // Recreate TestBed with store token null.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CoinsListService,
        provideMockStore({
          selectors: [{ selector: selectToken, value: null }],
        }),
      ],
    });

    service = TestBed.inject(CoinsListService);
    httpMock = TestBed.inject(HttpTestingController);

    service.getCoinsList().subscribe();

    const req = httpMock.expectOne(buildApiUrl('coins') + '/');
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush({ totalItems: 0, page: 1, pageSize: 20, totalPages: 0, items: [] });
  });
});

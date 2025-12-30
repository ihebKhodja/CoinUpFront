import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { buildApiUrl } from '../config/backend.config';

export type IdType = string | number;

export type QueryParams =
  | HttpParams
  | Record<
      string,
      | string
      | number
      | boolean
      | ReadonlyArray<string | number | boolean>
      | null
      | undefined
    >;

export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: QueryParams;
  context?: HttpContext;
  withCredentials?: boolean;
}

/**
 * Base HTTP service to avoid duplicating CRUD operations.
 *
 * Usage:
 *   export class CoinsService extends BackendService {
 *     constructor() { super('coins'); }  // Module name, not full URL
 *   }
 *
 * Or with custom API version:
 *   export class UsersService extends BackendService {
 *     constructor() { super('users', 'v2'); }
 *   }
 */
export abstract class BackendService {
  protected readonly http = inject(HttpClient);

  protected constructor(protected readonly resourceUrl: string) {
    if (!resourceUrl) {
      throw new Error('BackendService: resourceUrl is required');
    }
  }

  /**
   * Normalize HttpOptions to be compatible with HttpClient methods
   */
  protected normalizeOptions(options?: HttpOptions): any {
    if (!options) return undefined;
    
    const normalized: any = { ...options };
    
    if (options.params && !(options.params instanceof HttpParams)) {
      const record = options.params as Record<string, any>;
      let httpParams = new HttpParams();
      
      for (const key in record) {
        if (record[key] != null) {
          const value = record[key];
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (v != null) httpParams = httpParams.append(key, String(v));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      }
      
      normalized.params = httpParams;
    }
    
    return normalized;
  }

  /**
   * Build complete URL from base resource URL and optional path
   */
  protected buildUrl(path?: string | number): string {
    if (path === undefined || path === null) return this.resourceUrl;

    const base = this.resourceUrl;
    const suffix = String(path);

    if (base.endsWith('/') && suffix.startsWith('/')) {
      return base + suffix.slice(1);
    }
    if (!base.endsWith('/') && !suffix.startsWith('/')) {
      return `${base}/${suffix}`;
    }
    return base + suffix;
  }

  /**
   * GET - Fetch all items
   */
  list(options?: HttpOptions): Observable<any> {
    return this.http.get<any>(this.buildUrl(), this.normalizeOptions(options));
  }

  /**
   * GET - Fetch single item by ID
   */
  getById(id: IdType, options?: HttpOptions): Observable<any> {
    return this.http.get<any>(this.buildUrl(id), this.normalizeOptions(options));
  }

  /**
   * POST - Create new item
   */
  create(payload: any, options?: HttpOptions): Observable<any> {
    return this.http.post<any>(this.buildUrl(), payload, this.normalizeOptions(options));
  }

  /**
   * PUT - Replace entire item by ID
   */
  update(id: IdType, payload: any, options?: HttpOptions): Observable<any> {
    return this.http.put<any>(this.buildUrl(id), payload, this.normalizeOptions(options));
  }

  /**
   * PATCH - Partially update item by ID
   */
  patch(id: IdType, payload: any, options?: HttpOptions): Observable<any> {
    return this.http.patch<any>(this.buildUrl(id), payload, this.normalizeOptions(options));
  }

  /**
   * DELETE - Remove item by ID
   */
  delete(id: IdType, options?: HttpOptions): Observable<void> {
    return this.http.delete<void>(this.buildUrl(id), this.normalizeOptions(options)).pipe(
      map(() => undefined)
    );
  }

  /**
   * Helper for custom GET endpoints like: `/resource/:id/subresource`.
   * @example
   * protected getCustom(id: string) {
   *   return this.get(`${id}/details`);
   * }
   */
  protected get(path: string, options?: HttpOptions): Observable<any> {
    return this.http.get<any>(this.buildUrl(path), this.normalizeOptions(options));
  }

  /**
   * Helper for custom POST endpoints
   * @example
   * protected customAction(id: string, data: any) {
   *   return this.post(`${id}/action`, data);
   * }
   */
  protected post(
    path: string,
    payload?: unknown,
    options?: HttpOptions
  ): Observable<any> {
    return this.http.post<any>(this.buildUrl(path), payload, this.normalizeOptions(options));
  }

  /**
   * Helper for custom PUT endpoints
   */
  protected put(
    path: string,
    payload?: unknown,
    options?: HttpOptions
  ): Observable<any> {
    return this.http.put<any>(this.buildUrl(path), payload, this.normalizeOptions(options));
  }

  /**
   * Helper for custom PATCH endpoints
   */
  protected patchReq(
    path: string,
    payload?: unknown,
    options?: HttpOptions
  ): Observable<any> {
    return this.http.patch<any>(this.buildUrl(path), payload, this.normalizeOptions(options));
  }

  /**
   * Helper for custom DELETE endpoints
   */
  protected deleteRequest(path: string, options?: HttpOptions): Observable<any> {
    return this.http.delete<any>(this.buildUrl(path), this.normalizeOptions(options));
  }
}

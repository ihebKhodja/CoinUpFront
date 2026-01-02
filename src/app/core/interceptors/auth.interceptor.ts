import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectToken } from '../state/auth/auth.selectors';
import { take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return new Observable((observer) => {
      this.store
        .select(selectToken)
        .pipe(take(1))
        .subscribe((token: any) => {
          // Get token from store, or fallback to localStorage
          let authToken = token;
          if (!authToken) {
            authToken = localStorage.getItem('auth_token');
          }

          if (authToken) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${authToken}`,
              },
            });
          }
          next.handle(request).subscribe(
            (event) => observer.next(event),
            (error) => observer.error(error),
            () => observer.complete()
          );
        });
    });
  }
}

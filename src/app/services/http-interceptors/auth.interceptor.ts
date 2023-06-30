import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { StorageService } from '../storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private routes = [
    'v1/auth/login',
    'v1/auth/register',
    'v1/auth/sendOtp',
    'v1/auth/verifyOtp'
  ];

  constructor(private storage: StorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
    return from(
      this.allowToken(request) ?
      this.storage.get('userToken').then(token => {
        if(token)
        {
          request = request.clone({
            setHeaders: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: 'Bearer ' + token.token
            }
          });
        }
      })
      : Promise.resolve()
    ).pipe(mergeMap(() => next.handle(request)));
  }

  private allowToken(request: HttpRequest<any>): boolean {
    return !(new RegExp(this.routes.join('|')).test(request.url));
  }

}

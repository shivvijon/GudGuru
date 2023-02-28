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
    'v1/loads',
    'v1/loads/user-loads',
    'v1/auth/me',
    'v1/auth/updateDeviceId',
    'v1/auth/updateLocation',
    'v1/payment/stripeCheckout',
    'v1/payment/getPlans',
    'v1/payment/stripeLevel',
    'v1/auth/sendEmail',
    'v1/auth/verifyEmail',
    'v1/auth/me',
    'v1/auth/getTrialStatus',
    'v1/payment/cancelSubscription'
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
    return new RegExp(this.routes.join('|')).test(request.url);
  }

}

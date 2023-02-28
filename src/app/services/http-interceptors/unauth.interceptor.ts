import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogoutService } from '../api/logout.service';
import { ToastService } from '../api/toast.service';

@Injectable({
  providedIn: 'root'
})
export class UnauthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private api: LogoutService,
    private toast: ToastService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        async (requestError: any) => {
          if (requestError instanceof HttpErrorResponse && requestError.status === 401) {
            this.api.logout();
            this.toast.presentToast('Session Expired. Please login again.', 'danger');
          }
        },
      ),
    );
  }
}

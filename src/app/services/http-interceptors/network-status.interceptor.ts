import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../api/toast.service';
import { NetworkService } from '../network/network.service';

export class NetworkError extends Error {
  message = 'No Internet Connection.';
  status = 502;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusInterceptor implements HttpInterceptor {

  private networkStatus = false;

  constructor(
    private network: NetworkService,
    private toast: ToastService
  )
  {
    network.status$.subscribe((status) => {
      this.networkStatus = status.connected;
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(!this.networkStatus)
    {
      this.toast.presentToast('No Internet Connection', 'danger');
      return throwError(new NetworkError());
    }
    else {
      return next.handle(request);
    }
  }
}

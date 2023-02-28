/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quote-props */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders,HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  httpHeaders: any;
  httpOptions: any;
  planStatus: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  $planStatus = this.planStatus.asObservable();

  constructor(private http: HttpClient) { }

  makePayment(data: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/payment/stripeCheckout`, data);
  }


  getLevel(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/payment/stripeLevel`);
  }


  getPlans(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/payment/getPlans`);
  }

  getPlanStatus() {
    this.planStatus.next(null);
  }

  cancelSubscription(): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/payment/cancelSubscription`);
  }

}

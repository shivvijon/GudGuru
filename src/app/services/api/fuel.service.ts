import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FuelService {

  constructor(private http: HttpClient) { }

  getFuelRefills(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/fuelRefill`);
  }

  getFuelRefillById(id: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/fuelRefill/id/${id}`);
  }

  getStateDistance(origin: string, destination: string, currentTrip: any = null): Observable<any>
  {
    // eslint-disable-next-line no-underscore-dangle
    const query = currentTrip ? `dest=${destination}&id=${currentTrip._id}` : `origin=${origin}&dest=${destination}`;
    return this.http.get(`${environment.apiBaseUrl}/fuelRefill/stateDistance?${query}`);
  }

  addfuel(postData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/fuelRefill`, postData);
  }

  updateFuel(id: string, postData: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/fuelRefill/${id}`, postData);
  }

  deleteFuel(id: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/fuelRefill/${id}`);
  }

  getInvoice(doc: string): Observable<any> {
    return this.http.get(`${environment.imageUrl + doc}`, {responseType: 'blob', reportProgress: true, observe: 'events'});
  }

  getFuelInvoices(id: string, pointId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/fuelRefill/fuelInvoice/id/${id}?pointId=${pointId}`);
  }

  deleteFuelInvoice(id: string, pointId: string, doc: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/fuelRefill/fuelInvoice/id/${id}?pointId=${pointId}&doc=${doc}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TruckService {

  constructor(private http: HttpClient) { }

  getTrucks(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/truck`);
  }

  getUserTruck(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/truck/user-truck`, {});
  }

  getTruck(id): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/truck/${id}`);
  }

  deleteTruck(id): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/truck/${id}`);
  }

  getTruckParts(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/truckpart`);
  }

  getUserTruckParts(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/truckpart/user-truckpart`, {});
  }

  getTruckPart(id): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/truckpart/${id}`);
  }

  addTruck(truckPost): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/truck`, truckPost);
  }

  updateTruck(id, truckPost): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/truck/${id}`, truckPost);
  }

  addTruckPart(truckPost): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/truckpart`, truckPost);
  }

  updateTruckPart(id, truckPost): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/truckpart/${id}`, truckPost);
  }

  deleteTruckPart(id): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/truckpart/${id}`);
  }
}

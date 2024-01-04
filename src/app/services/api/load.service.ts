import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoadService {

  constructor(private http: HttpClient) { }

  getLoads(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/loads`);
  }

  filterLoads(filter): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/loads/filterLoads`, filter);
  }

  getEmergencyLoads(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/loads/loadsNotification`, {});
  }

  addLoad(loadPost): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/loads`, loadPost);
  }

  getUserLoads(): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/loads/user-loads`, {name: ''});
  }

  deleteUserLoad(id: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/loads/${id}`);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/auth/me`);
  }
}

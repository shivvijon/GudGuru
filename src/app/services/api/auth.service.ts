import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: any;
  isTrial: boolean;
  subscriptionStatus: string;
  daysLeft: number;
  isEmailModalOpen = false;

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) { }

  login(postData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, postData);
  }

  register(postData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/register`, postData);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/auth/me`);
  }

  getTrialStatus(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/auth/getTrialStatus`);
  }

  updateDeviceId(deviceToken): Observable<any> {
    const payLoad = {
      deviceToken
    };

    return this.http.put(`${environment.apiBaseUrl}/auth/updateDeviceId`, payLoad);
  }

  updateLocation(loc): Observable<any> {
    const location = {
      lat: loc.latitude,
      long: loc.longitude
    };

    return this.http.put(`${environment.apiBaseUrl}/auth/updateLocation`, {location});
  }


  sendOtp(data): Observable<any>
  {
    return this.http.post(environment.apiBaseUrl + '/auth/sendOtp', data);
  }

  verifyOtp(data): Observable<any>
  {
    return this.http.post(environment.apiBaseUrl + '/auth/verifyOtp', data);
  }


  addProfile(data): Observable<any>
  {
    return this.http.post(environment.apiBaseUrl + '/auth/register', data);
  }

  async showPlanUpgrade()
  {
    const alert = await this.alertController.create({
      header: 'Upgrade Plan',
      message: 'In order to use Emergency Load Services, you must upgrade the plan to <span>PLATINUM</span>.<br> <br>' +
               'Menu ---> Upgrade Plan ---> Upgrade.',
      cssClass: 'plan-upgrade',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [{
        text: 'Ok',
        role: 'cancel'
      }]
    });

    await alert.present();
  }

}

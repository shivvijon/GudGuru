import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

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
    private alertController: AlertController,
    private iab: InAppBrowser
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

  updateProfile(postData): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/auth/update-details`, postData);
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
      header: 'Complete signup',
      message: 'Please complete signup process in gudguru website',
      cssClass: 'plan-upgrade',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [{
        text: 'Ok',
        role: 'cancel',
        handler: () => { this.redirectToBrowser(); }
      }]
    });

    await alert.present();
  }

  async redirectToBrowser() {
    const browser = this.iab.create('https://gudguru.com/login-page', '_blank', {hideurlbar: 'yes'});
  }

}

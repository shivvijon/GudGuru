import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PushService } from '../push-notification/push.service';
import { StorageService } from '../storage.service';
import { GeolocationService } from 'background-geolocation';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private push: PushService,
    private router: Router,
    private storage: StorageService
  ) { }

  async logout()
  {
    // Retrieve Login Data
    const rememberMe = this.storage.get('rememberMe');
    const email = this.storage.get('email');
    const password = this.storage.get('password');

    this.storage.clear();

    // Save Login Data
    if(rememberMe) {
      await this.storage.set('rememberMe', rememberMe);
    }
    if(email) {
      await this.storage.set('email', email);
    }
    if(password) {
      await this.storage.set('password', password);
    }

    this.push.removeAllListeners();
    this.router.navigate(['login'], {replaceUrl: true});
    GeolocationService.stopTracking();
  }
}

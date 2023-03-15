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

  logout()
  {
    this.storage.clear();
    this.push.removeAllListeners();
    this.router.navigate(['login'], {replaceUrl: true});
    GeolocationService.stopTracking();
  }
}

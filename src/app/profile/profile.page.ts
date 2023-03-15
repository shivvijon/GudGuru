import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { PushService } from '../services/push-notification/push.service';
import { AuthService } from '../services/api/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    public location: Location,
    public emergency: EmergencyLoadService,
    public push: PushService,
    public api: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  navToNotifications()
  {
    if(!this.api.isTrial && this.api.user?.role === '0' &&
    (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      this.api.showPlanUpgrade();
    }
    else {
      this.router.navigate(['notification']);
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { ErrorService } from '../services/api/error.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnInit {

  isLoading: boolean;

  constructor(
    public emergency: EmergencyLoadService,
    public api: AuthService,
    private alert: ErrorService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.getTrialStatus();
  }

  ngOnInit() {
  }

  getTrialStatus()
  {
    this.isLoading = true;
    this.api.getTrialStatus().subscribe((resp) => {
      this.isLoading = false;
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;
      }
    });
  }

  comingSoon() {
    this.alert.comingSoon('Coming Soon.');
  }

  checkPlanActive()
  {

    if(!this.api.isTrial && this.api.user?.role === '0' &&
      (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      this.api.showPlanUpgrade();
    }
    else {
      this.router.navigate(['/tabs/listing/loads']);
    }
  }
}

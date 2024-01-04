import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { ErrorService } from '../services/api/error.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnInit {

  isLoading: boolean;
  socketSubs: Subscription;

  constructor(
    public emergency: EmergencyLoadService,
    public api: AuthService,
    private alert: ErrorService,
    private router: Router,
    private socket: SocketService
  ) { }

  ionViewWillEnter() {
    this.getTrialStatus();
    this.listenSocket();
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
    this.router.navigate(['/tabs/listing/loads']);
    /* if(!this.api.isTrial && this.api.user?.role === '0' &&
      (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      this.api.showPlanUpgrade();
    }
    else {
      this.router.navigate(['/tabs/listing/loads']);
    } */
  }

  navToNotifications()
  {
    if(!this.api.isTrial && this.api.user?.role === '0' &&
    (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      /* this.api.showPlanUpgrade(); */
      this.router.navigate(['tabs/listing/notification']);
    }
    else {
      this.router.navigate(['tabs/listing/notification']);
    }
  }

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getTrialStatus();
    });
  }

  ionViewWillLeave() {
    this.socketSubs.unsubscribe();
  }
}

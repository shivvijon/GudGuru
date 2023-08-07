import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-my-list',
  templateUrl: './my-list.page.html',
  styleUrls: ['./my-list.page.scss'],
})
export class MyListPage implements OnInit {

  isLoading: boolean;
  socketSubs: Subscription;

  constructor(
    public emergency: EmergencyLoadService,
    public api: AuthService,
    private router: Router,
    private socket: SocketService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getTrialStatus();
    this.listenSocket();
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

  navToNotifications()
  {
    if(!this.api.isTrial && this.api.user?.role === '0' &&
    (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      this.api.showPlanUpgrade();
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

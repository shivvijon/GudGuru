import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { LoadService } from '../services/api/load.service';
import { PushService } from '../services/push-notification/push.service';
import {  PaymentService } from '../services/api/payment.service';
import { ErrorService } from '../services/api/error.service';
import { SocketService } from '../services/socket/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  openLocation = false;
  clearLocation = false;
  loadLocation: any;
  level: any;
  isLoading: boolean;
  socketSubs: Subscription;

  constructor(
    private modalController: ModalController,
    private router: Router,
    public emergency: EmergencyLoadService,
    public push: PushService,
    public api: AuthService,
    private alert: ErrorService,
    public paymentService: PaymentService,
    private socket: SocketService
    )
  {
    emergency.registerLocationStateChange();
    push.checkNotificationCount();
    emergency.checkPermission(true);
  }

  ngOnInit() {}

  ionViewWillEnter()
  {
    this.getProfile();
    this.listenSocket();
  }

  getProfile()
  {
    this.isLoading = true;
    this.api.getProfile().subscribe((resp) => {
      if(resp.success) {
        this.api.user = resp.data;
        console.log(this.api.user.role, 'testing');
        this.getTrialStatus();
      }
    });
  }

  getTrialStatus()
  {
    this.api.getTrialStatus().subscribe((resp) => {
      this.isLoading = false;
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;
      }
    });
  }

  async openLocationModal()
  {
    this.openLocation = true;
    this.clearLocation = true;
  }

  getLoadLocation(locationData)
  {
    this.loadLocation = locationData;
    console.log(locationData);
    this.openLocation = false;
    this.clearLocation = false;

    this.modalController.dismiss().then(() => {
      if(this.loadLocation)
      {
        const navExtras: NavigationExtras = {
          state: { location: this.loadLocation }
        };

        this.router.navigate(['tabs/home/loadsList'], navExtras);
      }
    });
  }

  comingSoon(){
    this.alert.comingSoon('Coming Soon.');
  }

  navToNotifications()
  {
    if(!this.api.isTrial && this.api.user?.role === '0' &&
    (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      this.api.showPlanUpgrade();
    }
    else {
      this.router.navigate(['tabs/home/notification']);
    }
  }

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getProfile();
    });
  }

  ionViewWillLeave() {
    this.socketSubs.unsubscribe();
  }

}

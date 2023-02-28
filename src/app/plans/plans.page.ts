import { Component, OnInit } from '@angular/core';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { Router, NavigationExtras } from '@angular/router';
import {  PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';
import { LoadService } from '../services/api/load.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
})
export class PlansPage implements OnInit {
  userdata: any;
  level: any;
  silver: any;
  platinum: any;
  emailStatus: any;
  planStatusSub: Subscription;
  isPlanLoading: boolean;
  isLoading: boolean;
  subStatus: string;

  constructor(
    public emergency: EmergencyLoadService,
    private router: Router,
    public paymentService: PaymentService,
    public userService: AuthService,
    private loadService: LoadService,
    private alertController: AlertController,
    private storage: StorageService
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.listenPlanStatusChange();
  }

  listenPlanStatusChange()
  {
    this.planStatusSub = this.paymentService.$planStatus.subscribe(() => {
      this.isPlanLoading = true;
      this.getProfile();
    });
  }

  getProfile()
  {
    this.loadService.getProfile().subscribe(resp => {
      this.emailStatus = resp.data;
      this.userService.user = resp.data;
      this.level = resp.data.role;
      this.getPlans();
      console.log(this.emailStatus);
    },
    (err) => {
      console.error(err);
    });
  }

  getPlans()
  {
    this.paymentService.getPlans().subscribe(resp => {
      this.isPlanLoading = false;
      console.log(resp);
      this.platinum=resp.plans[0];
      this.subStatus = resp.subscriptionStatus;
      // console.log( this.silver, this.platinum);
    },
    (err) => {
      console.error(err);
    });
  }

  makePayment(amount: any, level: any, mode: string | null = null)
  {
    if(this.emailStatus.isEmailVerified){
    const value = {
         amount,
         level,
         mode
    };
    const navExtras: NavigationExtras = {
      state: {data: value}
    };

    if(this.userService.user.isSubscribed) {
      this.router.navigate(['/tabs/profile/payment'], navExtras);
    }
    else {
      this.router.navigate(['/payment'], navExtras);
    }

    // this.router.navigate(['/tabs/profile/thanks']);
  }
  else{
    this.userService.isEmailModalOpen = true;
    console.log('make payment');
  }
}

  ionViewWillLeave() {
    this.planStatusSub.unsubscribe();
  }

  cancelSubscription()
  {
    this.isLoading = true;
    this.paymentService.cancelSubscription().subscribe((resp) => {
      this.isLoading = false;
      this.isPlanLoading = true;
      this.getProfile();

      this.storage.get('userToken').then(userToken => {
        userToken.isSubscribed = false;
        this.storage.set('userToken', userToken);
        this.router.navigate(['/plan']);
      });
    },
    (err) => {
      this.isLoading = false;
      console.error(err);
    });
  }

  async presentAlert()
  {
    const alert = await this.alertController.create({
      header: 'Cancel Platinum Subscription',
      message: 'Are you sure you want to cancel this subscription?',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: () => {this.cancelSubscription();}
        }
      ],
    });

    await alert.present();
  }

}

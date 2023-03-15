import { Component, OnInit } from '@angular/core';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { Router, NavigationExtras } from '@angular/router';
import {  PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';
import { LoadService } from '../services/api/load.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { IAPProduct, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { environment } from 'src/environments/environment';

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
  plan: IAPProduct;

  constructor(
    public emergency: EmergencyLoadService,
    private router: Router,
    public paymentService: PaymentService,
    public userService: AuthService,
    private loadService: LoadService,
    private alertController: AlertController,
    private storage: StorageService,
    private store: InAppPurchase2
  ) { }

  ngOnInit()
  {
    this.store.verbosity = this.store.DEBUG;
    this.registerPlans();
    this.listenStorePurchase();

    this.store.ready(() => {
      this.plan = this.store.products[0];
      //this.ref.detectChanges();
    });
  }

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

  registerPlans()
  {
    this.store.register({
      id: environment.platinumId,
      type: this.store.PAID_SUBSCRIPTION
    });

    this.store.refresh();
  }

  listenStorePurchase()
  {
    this.store.when(environment.platinumId).approved((p: IAPProduct) => {
      if(p.id === environment.platinumId) {
        return p.verify();
      }
    })
    .verified((p: IAPProduct) => p.finish());
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

    this.router.navigate(['/tabs/profile/payment'], navExtras);
    // this.router.navigate(['/tabs/profile/thanks']);
  }
  else{
    this.userService.isEmailModalOpen = true;
    console.log('make payment');
  }
}

  subscribeInAppPurchase()
  {
    this.store.order(this.plan).then(p => {
      // Purchase in progress!
    }, e => {
      alert('Failed..' + e);
    });
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

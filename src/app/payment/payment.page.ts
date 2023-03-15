/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-const */
/* eslint-disable id-blacklist */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stripe } from '@awesome-cordova-plugins/stripe/ngx';
import {  PaymentService } from '../services/api/payment.service';
import { ToastService } from '../services/api/toast.service';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { environment } from 'src/environments/environment';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/api/auth.service';

@disableSideMenu()
@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  getData: any;
  makePayment: FormGroup;
  isCardUpdating: boolean;
  cardDetails: any = {};
  loading: boolean;

  constructor(
    private stripe: Stripe,
    private toast: ToastService,
    public paymentService: PaymentService,
    private userService: AuthService,
    private storage: StorageService,
    private router: Router,private route: ActivatedRoute,public formBuilder: FormBuilder)
   {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.getData = this.router.getCurrentNavigation().extras.state.data;
        console.log(this.getData);

      }
    });
   }

  ngOnInit() {
    this.makePayment = this.formBuilder.group({
      nameOnCard: new FormControl(null, [Validators.required]),
      accountNumber: new FormControl(null, [Validators.required]),
      expireMonth: new FormControl(null, [Validators.required]),
      expireYear: new FormControl(null, [Validators.required]),
      cardVerificationValue: new FormControl(null),
    });
  }

  get errorControl(){return this.makePayment.controls;}


  stripePayment()
  {
  if(this.makePayment.valid){
    this.loading=true;
    this.stripe.setPublishableKey(environment.stripeKey);

    this.cardDetails = {
      number: this.makePayment.controls['accountNumber'].value,
      expMonth: this.makePayment.controls['expireMonth'].value,
      expYear: this.makePayment.controls['expireYear'].value,
      cvc: this.makePayment.controls['cardVerificationValue'].value
    };

    console.log(this.cardDetails);

    this.stripe.createCardToken(this.cardDetails)
      .then(token => {
        console.log(token, 'token is empty');
        let data ={
          stripeToken:{
            name:  this.makePayment.controls['nameOnCard'].value,
            id : token.id
          },
          orderTotal: this.getData.amount,
          level: this.getData.level,
          mode: this.getData.mode
         };
        this.makeStripePayment(data);
      })
      .catch(error => {
        console.error(error);
        this.toast.presentToast(error, 'danger');
        this.makePayment.reset();
        this.loading=false;
      });
    }
    else {
      console.log('Please provide all the required values!');
      this.loading=false;
    }
  }

  makeStripePayment(data){
    this.paymentService.makePayment(data).subscribe((res) =>{
      console.log(res);
      this.loading=false;
      this.paymentService.planStatus.next(null);

      if(res.success) {
        this.storage.get('userToken').then(userToken => {
          userToken.isSubscribed = true;
          this.storage.set('userToken', userToken);
        });
      }

      const navExtras: NavigationExtras = {
        state: {data: res},
        replaceUrl: true
      };

      this.router.navigate(['/tabs/profile/thanks'], navExtras);
    //  this.router.navigate(['/tabs/profile/thanks']);
    });
  }

}

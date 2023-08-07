import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorService } from '../services/api/error.service';
import { LoadService } from '../services/api/load.service';
import { PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';

@Component({
  selector: 'app-email-otp',
  templateUrl: './email-otp.page.html',
  styleUrls: ['./email-otp.page.scss'],
})
export class EmailOtpPage implements OnInit {
  logForm: FormGroup;
  loading = false;
  loading2 = false;
  showFooter = true;
  emailStatus: any;
  showPass = false;
  setOtp: any;
  section1 = true;
  mobile: any;
  sendOtp: FormGroup;

  otpForm = new FormGroup({
    email: new FormControl(''),
    otp: new FormControl(''),
  });
  constructor( private alert: ErrorService,
    private router: Router,
    private auth: AuthService,
    private load: LoadService,
    private paymentService: PaymentService) {
      this.sendOtp = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.email]),
      },);
    }

  ngOnInit() {
    this.getProfile();
  }


  getProfile()
  {
    this.load.getProfile().subscribe(resp => {
      this.emailStatus = resp.data;
      console.log(this.emailStatus);
      this.sendOtp.patchValue({
        email: this.emailStatus.email,
      });
    },
    (err) => {
      console.error(err);
    });
  }


  submitEmail(){
    if (!this.sendOtp.valid) {
     console.log('Please provide all the required values!');
    } else {
     this.loading=true;
     this.auth.sendOtpMail(this.sendOtp.value).subscribe((response) => {

       console.log(response);
       this.section1 = !this.section1;
       this.loading=false;
     },
     (err) => {
       console.log(err.error);
       this.alert.presentAlert('Login Error', err.error.massage);
       this.loading=false;
     });
   }
   }

   backSignup(){
    this.section1 = !this.section1;
   }

   onOtpChange(event){
     const otpValue=event;
     this.setOtp='otpNotValid';
     if(event.length===4){
       this.setOtp='otpValid';
       this.otpForm.patchValue({
        otp: otpValue,
      });
     }
   }

   submitOtp(){
     if(this.setOtp==='otpValid'){
       this.loading2=true;
       const postData = {
        email: this.sendOtp.controls.email.value,
        otp: this.otpForm.controls.otp.value
       };

       this.auth.verifyOtpMail(postData).subscribe((response) => {
         console.log(response.isActive);
         if(response.success===true)
         {
            if(this.emailStatus.isSubscribed) {
              this.router.navigate(['/tabs/profile/plans']);
            }
            else {
              this.router.navigate(['/plan']);
            }

            this.paymentService.getPlanStatus();
         }
         else
         {
            this.alert.presentAlert('Invalid OTP', response.message);
            this.loading2=false;
         }
       },
       (err) => {
         console.log(err.error);
         this.alert.presentAlert('Verification Error', err.error.message);
         this.loading2=false;
       });
      }
   }
}

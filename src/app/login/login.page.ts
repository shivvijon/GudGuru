/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { AuthService } from '../services/api/auth.service';
import { ErrorService } from '../services/api/error.service';
import { StorageService } from '../services/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushService } from '../services/push-notification/push.service';

@disableSideMenu()
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  logForm: FormGroup;
  loading = false;
  loading2 = false;
  showFooter = true;
  showPass = false;
  setOtp: any;
  section1 = true;
  mobile: any;
  sendOtp = new FormGroup({
    contact: new FormControl(''),
   });

  otpForm = new FormGroup({
    contact: new FormControl(''),
    otp: new FormControl(''),
  });

  countryCode = '+91';

  constructor(
    private apiService: AuthService,
    private alert: ErrorService,
    private storage: StorageService,
    private router: Router,
    private push: PushService,
    private cdr: ChangeDetectorRef)
  {
    this.sendOtp = new FormGroup({
      contact: new FormControl(null, [Validators.required]),
      // contact: new FormControl(null, [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]),
      // phone: new FormControl(null, [Validators.required, Validators.pattern('^\([0-9]{3}\)[0-9]{3}-[0-9]{4}$')]),
    });

    this.otpForm = new FormGroup({
      contact: new FormControl(''),
      otp: new FormControl(null),
    });
  }

  ionViewDidEnter(): void {
    SplashScreen.hide();
  }

  ngOnInit()
  {
    Keyboard.addListener('keyboardDidShow', () => {
      this.showFooter = false;
      this.cdr.detectChanges();
    });

    Keyboard.addListener('keyboardDidHide', () => {
      this.showFooter = true;
      this.cdr.detectChanges();
    });
  }

  // login(isEnterKeyHit: boolean = false)
  // {
  //   if(isEnterKeyHit) {
  //     Keyboard.hide();
  //   }

  //   this.loading = true;
  //   this.apiService.login(this.logForm.value).subscribe((resp) => {
  //     console.log(resp);
  //     this.loading = false;
  //     if(resp.success)
  //     {
  //       this.storage.set('token', resp.token).then(() => {
  //         this.push.initAndroidPush();
  //       });

  //       this.router.navigate(['/tabs'], {replaceUrl: true});
  //     }
  //   },
  //   (err) => {
  //     console.error(err);
  //     this.loading = false;
  //     if(err.status !== 502) {
  //       if(!err.error?.success) {
  //         this.alert.presentAlert('Login Error', err.error.massage);
  //       }
  //       else {
  //         this.alert.presentAlert('Login Error', 'Unable to login.');
  //       }
  //     }
  //   });
  // }

  submitMobile(){
   if (!this.sendOtp.valid) {
    console.log('Please provide all the required values!');
   } else {
    this.mobile = this.countryCode + this.sendOtp.controls['contact'].value;
    const data={
      contact :  this.mobile,
    };
    this.loading=true;
    this.apiService.sendOtp(data).subscribe((response) => {

      console.log(response);
      this.section1 = !this.section1;
      // this.mobile = '+' + this.sendOtp.controls['contact'].value;
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
    window.location.reload();
  }

  onOtpChange(event){
    const otpValue=event;
    this.setOtp='otpNotValid';
    if(event.length===4){
      this.setOtp='otpValid';
      this.otpForm.setValue({
          contact: this.mobile,
          otp: otpValue,
      });
    }
  }

  submitOtp(isEnterKeyHit: boolean = false)
  {
    if(this.setOtp==='otpValid')
    {
      if(isEnterKeyHit) {
        Keyboard.hide();
      }

      this.loading2=true;
      this.apiService.verifyOtp(this.otpForm.value).subscribe((response) => {
        console.log(response.isActive);
        if(response.success===true)
        {
          if(!response.isActive)
          {
            this.section1 = true;
            localStorage.setItem('phoneNumber', this.mobile);
            this.router.navigate(['/policy']);

            /* this.alert.presentAlert("Finish signing up on the website.",
            "Unfortunately, this app doesn't support in-app sign up. Sign in on the GudGuru website to start your membership."); */
          }
          else
          {
            const userToken = {
              token: response.token,
              isSubscribed: response.isSubscribed
            };

            this.storage.set('userToken', userToken).then(() => {
              this.push.initAndroidPush();
            });

            this.router.navigate(['/tabs'], {replaceUrl: true});
          }
        }
        else{
          this.alert.presentAlert('Login Error', response.message);
          this.loading2=false;
        }
      },
      (err) => {
        console.log(err.error);
        this.alert.presentAlert('Login Error', err.error.message);
        this.loading2=false;
      });
     }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { AuthService } from '../services/api/auth.service';
import { ErrorService } from '../services/api/error.service';
import { ToastService } from '../services/api/toast.service';
import { Keyboard } from '@capacitor/keyboard';
import { StorageService } from '../services/storage.service';
import { PushService } from '../services/push-notification/push.service';

@disableSideMenu()
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  regForm: FormGroup;
  showPass = false;
  showPass2 = false;
  loading = false;
  signupPhoneNumber: any;
  constructor(
    private apiService: AuthService,
    private router: Router,
    private alert: ErrorService,
    private storage: StorageService,
    private toast: ToastService,
    private push: PushService,
  )
  {
    this.signupPhoneNumber=localStorage.getItem('phoneNumber');
    this.regForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(this.signupPhoneNumber)
    },);
  }

  ngOnInit() {
  }

  register(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    // this.loading = true;
    // const postData = this.regForm.value;
    // postData.image = '';
    // delete postData.cnfPassword;

    // console.log(postData);
    // this.api.register(postData).subscribe(resp => {
    //   console.log(resp);
    //   this.loading = false;
    //   if(resp.success)
    //   {
    //     this.toast.presentToast('Sign Up Success. Plaese LogIn to Continue', 'success');
    //     this.router.navigate(['login'], {replaceUrl: true});
    //   }

    // }, (err) => {
    //   console.log(err);
    //   this.loading = false;
    //   if(err.status !== 502) {
    //     if(!err.error?.success) {
    //       this.alert.presentAlert('Registration Error', err.error.massage);
    //     }
    //     else {
    //       this.alert.presentAlert('Registration', 'Unable to register.');
    //     }
    //   }
    // });

    if (!this.regForm.valid) {
      console.log('Please provide all the required values!');
     } else {
      this.loading=true;
      this.apiService.addProfile(this.regForm.value).subscribe((response) => {

        console.log(response);
        if(response.success === true)
        {
          this.loading=false;

          const userToken = {
            token: response.token,
            isSubscribed: response.isSubscribed
          };

          this.storage.set('userToken', userToken).then(() => {
            this.push.initAndroidPush();
          });

          this.router.navigate(['/tabs'], {replaceUrl: true});
        }
      },
      (err) => {
        console.log(err.error);
        this.alert.presentAlert('Login Error', err.error.massage);
        this.loading=false;
      });
    }

  }

  // confirmPasswordCheck(): ValidatorFn
  // {
  //   return (formGroup: FormGroup) => {
  //     const cnfPassControl = formGroup.controls.cnfPassword;
  //     const passControl = formGroup.controls.password;

  //     if(cnfPassControl.value !== passControl.value) {
  //       cnfPassControl.setErrors({passMismatch: true});
  //     }

  //     return null;
  //   };
  // }

}

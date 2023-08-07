import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { disableSideMenu } from '../../decorators/side-menu.decorator';
import { AuthService } from '../../services/api/auth.service';
import { ErrorService } from '../../services/api/error.service';
import { ToastService } from '../../services/api/toast.service';
import { Keyboard } from '@capacitor/keyboard';
import { StorageService } from '../../services/storage.service';
import { PushService } from '../../services/push-notification/push.service';
import { environment } from 'src/environments/environment';

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
  loginData: any;
  /* email: string;
  signupPhoneNumber: string; */

  constructor(
    private apiService: AuthService,
    private router: Router,
    private alert: ErrorService,
    private storage: StorageService,
    private toast: ToastService,
    private push: PushService,
    private route: ActivatedRoute
  )
  {
    /* this.email = localStorage.getItem('email');
    this.signupPhoneNumber = localStorage.getItem('phoneNumber'); */
    this.regForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [Validators.required])
    });

    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state?.loginData)
      {
        this.loginData = router.getCurrentNavigation().extras.state.loginData;
        this.patchForm();
      }
    });

    /* if(this.email) {
      this.regForm.controls.email.disable({onlySelf: true});
    }

    if(this.signupPhoneNumber) {
      this.regForm.controls.phone.disable({onlySelf: true});
    } */
  }

  ngOnInit() {
  }

  patchForm()
  {
    if(this.loginData.loginMode === 'email' && this.loginData.email)
    {
      this.regForm.patchValue({email: this.loginData.email});
      this.regForm.controls.email.disable({onlySelf: true});
    }
    else if(this.loginData.loginMode === 'phone' && this.loginData.phone)
    {
      this.regForm.patchValue({phone: this.loginData.phone});
      this.regForm.controls.phone.disable({onlySelf: true});
    }
  }

  register(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    if (!this.regForm.valid) {
      console.log('Please provide all the required values!');
    }
    else
    {
      this.loading=true;

      const postData = JSON.parse(JSON.stringify(this.regForm.value));
      if(this.loginData.loginMode === 'email' && this.loginData.email) {
        postData.email = this.loginData.email;
      }
      if(this.loginData.loginMode === 'phone' && this.loginData.phone) {
        postData.phone = this.loginData.phone;
      }
      else {
        postData.phone = environment.countryCode + postData.phone;
      }

      this.apiService.addProfile(postData, this.loginData.loginMode).subscribe((response) => {
        if(response.success === true)
        {
          this.loading=false;

          const userToken = {
            token: response.token,
            isSubscribed: response.isSubscribed,
            userId: response.userId
          };

          this.storage.set('userToken', userToken).then(() => {
            this.push.initAndroidPush();
          });

          this.router.navigate(['/tabs'], {replaceUrl: true});
        }
      },
      (err) => {
        console.log(err.error);
        this.alert.presentAlert('Login Error', err.error.message);
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

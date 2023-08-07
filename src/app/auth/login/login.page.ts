/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { disableSideMenu } from '../../decorators/side-menu.decorator';
import { AuthService } from '../../services/api/auth.service';
import { ErrorService } from '../../services/api/error.service';
import { StorageService } from '../../services/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushService } from '../../services/push-notification/push.service';
import { Keyboard } from '@capacitor/keyboard';

@disableSideMenu()
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  logForm: FormGroup;
  loading = false;
  showPass = false;
  rememberMe = false;

  constructor(
    private apiService: AuthService,
    private alert: ErrorService,
    private storage: StorageService,
    private router: Router,
    private push: PushService,
    private cdr: ChangeDetectorRef)
  {
    this.logForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });

    this.patchForm();
  }

  ionViewDidEnter(): void {
    SplashScreen.hide();
  }

  setRememberMe(event: any) {
    this.rememberMe = event.target.checked;
  }

  async patchForm()
  {
    const rememberMe = await this.storage.get('rememberMe');
    if(rememberMe !== undefined || rememberMe !== null) {
      this.rememberMe = rememberMe;
    }

    const email = await this.storage.get('email');
    const password = await this.storage.get('password');

    if(this.rememberMe) {
      this.logForm.patchValue({email, password});
    }
  }

  login(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    this.loading=true;
    this.apiService.login(this.logForm.value).subscribe(response => {
      if(this.rememberMe)
      {
        this.storage.set('rememberMe', this.rememberMe);
        this.storage.set('email', this.logForm.value.email);
        this.storage.set('password', this.logForm.value.password);
      }

      if(!response.isActive)
      {
        const navExtras: NavigationExtras = {
          state: {loginData: {loginMode: 'email', email: this.logForm.value.email}}
        };
        this.router.navigate(['/policy'], navExtras);
      }
      else
      {
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
      this.loading=false;
    },
    (err) => {
      this.loading=false;
      console.log(err);
      this.alert.presentAlert('Login Error', err.error.message);
    });
  }

}

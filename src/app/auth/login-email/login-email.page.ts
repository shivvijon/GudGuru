/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { disableSideMenu } from '../../decorators/side-menu.decorator';
import { AuthService } from '../../services/api/auth.service';
import { ErrorService } from '../../services/api/error.service';
import { StorageService } from '../../services/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { PushService } from '../../services/push-notification/push.service';

@disableSideMenu()
@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.page.html',
  styleUrls: ['./login-email.page.scss'],
})
export class LoginEmailPage {

  logForm: FormGroup;
  loading = false;

  constructor(
    private apiService: AuthService,
    private alert: ErrorService,
    private storage: StorageService,
    private router: Router,
    private push: PushService,
    private cdr: ChangeDetectorRef)
  {
    this.logForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      cnfmPass: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    },{validators: confirmPasswordValidator});
  }

  login(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    this.loading=true;
    this.apiService.registerEmail(this.logForm.value).subscribe(response => {
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

export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => control.value.password === control.value.cnfmPass
    ? null
    : { passwordMismatch: true };

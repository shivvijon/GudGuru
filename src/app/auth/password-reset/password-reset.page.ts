/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/quotes */
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { disableSideMenu } from '../../decorators/side-menu.decorator';
import { AuthService } from '../../services/api/auth.service';
import { ErrorService } from '../../services/api/error.service';
import { StorageService } from '../../services/storage.service';
import { Keyboard } from '@capacitor/keyboard';
import { PushService } from '../../services/push-notification/push.service';
import { ToastService } from 'src/app/services/api/toast.service';

@disableSideMenu()
@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage {

  logForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  showPass1 = false;
  showPass2 = false;
  step = 1;
  otp: number;
  timer = 30;
  interval: any;

  constructor(
    private apiService: AuthService,
    private alert: ErrorService,
    private storage: StorageService,
    private router: Router,
    private push: PushService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef)
  {
    this.logForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])});

    this.passwordForm = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      cnfmPass: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    },{validators: confirmPasswordValidator});
  }

  onOtpChange(event) {
    if(event.length === 4) {
      this.otp = event;
    }
  }

  sendOtp(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    this.loading=true;
    clearInterval(this.interval);

    this.apiService.sendOtpMail(this.logForm.value).subscribe(response => {
      this.interval = setInterval(() => {
        if(this.timer > 0) {
          --this.timer;
        }
        else {
          clearInterval(this.interval);
        }
      }, 1000);

      this.loading=false;
      this.step = 2;
    },
    (err) => {
      this.loading=false;
      console.log(err);
      this.alert.presentAlert('Error', err.error.message);
    });
  }

  verifyOtp(isEnterKeyHit: boolean = false)
  {
    const postData = {
      email: this.logForm.value.email,
      otp: this.otp
    };

    this.loading = true;

    this.apiService.verifyOtpMail(postData).subscribe((response) => {
      this.loading = false;
      if(response.success)
      {
        this.step = 3;
        clearInterval(this.interval);
        this.timer = 30;
      }
      else {
        this.alert.presentAlert('Invalid OTP', response.message);
      }
    },
    (err) => {
      console.log(err.error);
      this.alert.presentAlert('Verification Error', err.error.message);
      this.loading = false;
    });
  }

  resetPassword(isEnterKeyHit: boolean = false)
  {
    const postData = {
      email: this.logForm.value.email,
      password: this.passwordForm.value.password
    };

    this.loading = true;

    this.apiService.updatePassword(postData).subscribe((response) => {
      this.router.navigate(['/login'], {replaceUrl: true});
      this.toast.presentToast(response.message, 'success');
      this.step = 1;
      this.loading = false;
    },
    (err) => {
      console.log(err.error);
      this.alert.presentAlert('Error', err.error.message);
      this.loading = false;
    });
  }

}

export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => control.value.password === control.value.cnfmPass
    ? null
    : { passwordMismatch: true };

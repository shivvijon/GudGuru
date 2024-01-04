import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { PushService } from '../services/push-notification/push.service';
import { AuthService } from '../services/api/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ToastService } from '../services/api/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  isLoading = false;

  constructor(
    public location: Location,
    public emergency: EmergencyLoadService,
    public push: PushService,
    public api: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toast: ToastService
  ) { }

  ngOnInit() {
    console.log('init');
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.api.getProfile().subscribe((resp) => {
      if(resp.success) {
        this.api.user = resp.data;
        this.isLoading = false;
      }
    });
  }

  navToNotifications()
  {
    if(!this.api.isTrial && this.api.user?.role === '0' &&
    (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) {
      // this.api.showPlanUpgrade();
      this.router.navigate(['tabs/profile/notification']);
    }
    else {
      this.router.navigate(['tabs/profile/notification']);
    }
  }

  async presentAlert()
  {
    const alert = await this.alertController.create({
      header: 'Please enter your new email',
      mode: 'ios',
      backdropDismiss: false,
      cssClass: 'emailPrompt',
      inputs: [
        {
          type: 'email',
          name: 'email',
          placeholder: 'Email',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) =>
          {
            const formControl = new FormControl(data.email, [Validators.required, Validators.email]);
            if(formControl.valid) {
              this.updateProfile(data);
            }
            else {
              alert.message = 'Enter valid email';
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  updateProfile(data: any)
  {
    this.isLoading = true;
    this.api.updateProfile(data).subscribe(resp => {
      console.log(resp);
      this.toast.presentToast('Email updated successfully', 'success');
      this.ionViewWillEnter();
    },
    (err) => {
      this.isLoading = false;
      this.toast.presentToast('Email already taken. Please choose different email.', 'danger');
      console.error(err);
    });
  }

}

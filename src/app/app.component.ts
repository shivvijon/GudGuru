import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { EmergencyLoadService } from './services/api/emergency-load.service';
import { PushService } from './services/push-notification/push.service';
import { LogoutService } from './services/api/logout.service';
import { AuthService } from './services/api/auth.service';
import { NetworkService } from './services/network/network.service';
import { ToastService } from './services/api/toast.service';
import { App } from '@capacitor/app';
import { NativeMarket } from '@capacitor-community/native-market';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private storage: StorageService,
    private router: Router,
    private modalController: ModalController,
    private location: Location,
    public emergency: EmergencyLoadService,
    private push: PushService,
    public api: LogoutService,
    public auth: AuthService,
    private network: NetworkService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toast: ToastService
  )
  {
    platform.backButton.subscribeWithPriority(10, () => {
      modalController.getTop().then(modal => {
        if(modal)
        {
          const btn: any = modal.getElementsByClassName('hardware-tap')[0];
          btn.click();
        }
        else {
          location.back();
        }
      });
    });

    this.initApp();
  }

  async initApp()
  {
    const platform = await this.platform.ready();

    await this.storage.init();

    this.storage.get('userToken').then((userToken: any) => {
      if (platform === 'cordova' || true)
      {
        setTimeout(() => {
          SplashScreen.hide();
        }, 500);

        if(userToken?.token)
        {
          this.push.initAndroidPush();
          this.router.navigate(['/tabs']);
        }
        else {
          this.router.navigate(['/login']);
        }

        this.checkUpdates();
      }
    });

    this.network.status$.subscribe();
  }

  redirectContactUs()
  {
    const a = document.createElement('a');
    a.href = 'https://gudguru.com/contact';
    a.click();
  }

  async deactivateConfirm()
  {
    const alert = await this.alertController.create({
      header: 'Deactivate account',
      message: `Are you sure you want to delete your account?
                <p>Warning: This cannot be undone</p>
                <ul>
                  <li>Loads and stored data will be removed</li>
                  <li>Username and passwords will be deleted</li>
                  <li>Account will be permanently disabled</li>
                </ul>`,
      cssClass: ['delete-alert', 'account-delete'],
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'btn-cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          cssClass: 'btn-delete',
          handler: () => this.deleteAccount()
        },
      ]
    });

    await alert.present();
  }

  deleteAccount()
  {
    this.showLoading();
    this.auth.deleteAccount().subscribe(resp => {
      this.loadingController.dismiss();
      this.api.logout();
      this.toast.presentToast(resp.message, 'success');
    },
    (err) => {
      this.loadingController.dismiss();
      console.error(err);
      this.toast.presentToast('Unable to deactivate account.', 'danger');
    });
  }

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Deactivating account please wait...',
      spinner: 'crescent',
      backdropDismiss: false
    });

    await loading.present();
  }

  async checkUpdates()
  {
    let appInfo = {androidVer: -1, iosVer: -1};
    this.auth.getAppInfo().subscribe(async (resp) => {
      appInfo = resp.data;
      console.log(resp);

      const info = await App.getInfo();
      if(this.platform.is('ios')) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        appInfo.iosVer > parseFloat(info.version) ? this.presentUpdateAlert() : null;
      }
      else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        appInfo.androidVer > parseFloat(info.version) ? this.presentUpdateAlert() : null;
      }
    });
  }

  async presentUpdateAlert()
  {
    const alert = await this.alertController.create({
      header: 'Update App',
      message: `Please update the app to latest version in order to use latest features.`,
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Update',
          handler: () => { this.directToAppStore(); return false; }
        },
      ]
    });

    await alert.present();
  }

  directToAppStore() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.platform.is('ios') ? NativeMarket.openStoreListing({appId: 'id6444596230'}) :
                              NativeMarket.openStoreListing({appId: 'com.gudguru.app'});
  }
}

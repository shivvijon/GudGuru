import { Component } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { EmergencyLoadService } from './services/api/emergency-load.service';
import { PushService } from './services/push-notification/push.service';
import { LogoutService } from './services/api/logout.service';
import { AuthService } from './services/api/auth.service';
import { NetworkService } from './services/network/network.service';


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
    private network: NetworkService
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
}

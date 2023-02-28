import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { AuthService } from '../api/auth.service';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  isNotifNew = false;
  countNotifNew: number;
  /* canInitPush = false; */

  constructor(
    private api: AuthService,
    private storage: StorageService,
    private router: Router,
    private platform: Platform
  )
  {
    if(platform.is('android')) {
      PushNotifications.createChannel({
        id: 'emergency',
        name: 'Emergency Alert',
        importance: 5
      });
    }
  }

  initAndroidPush()
  {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      this.api.updateDeviceId(token.value).subscribe(() => {});
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      /* alert('Error on registration: ' + JSON.stringify(error)); */
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      this.isNotifNew = true;
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      this.isNotifNew = true;
      this.storage.get('userToken').then(token => {
        if(token) {
          this.router.navigate(['/tabs/home/notification']);
        }
        else {
          this.router.navigate(['/login']);
        }
      });
    });
  }

  checkNotificationCount()
  {
    PushNotifications.getDeliveredNotifications().then((notifData) => {
      if(notifData.notifications.length) {
        this.countNotifNew = notifData.notifications.length;
        this.isNotifNew = true;
      }
    });
  }

  clearNotifications() {
    PushNotifications.removeAllDeliveredNotifications().then(() => {
      this.isNotifNew = false;
    });
  }

  async removeAllListeners(): Promise<void> {
    return PushNotifications.removeAllListeners();
  }
}

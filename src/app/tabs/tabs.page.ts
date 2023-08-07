import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { SocketService } from '../services/socket/socket.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    public emergency: EmergencyLoadService,
    public api: AuthService,
    private loadingController: LoadingController,
    private storage: StorageService,
    private socket: SocketService) { }

  ngOnInit() {
    this.initSocket();
  }

  getTrialStatus()
  {
    this.presentLoader();
    this.api.getTrialStatus().subscribe((resp) => {
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;

        this.loadingController.dismiss().then(() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (!this.api.isTrial && this.api.user?.role === '0' &&
          (this.api.subscriptionStatus === 'inactive' || this.api.subscriptionStatus === 'past_due')) ?
          this.api.showPlanUpgrade() : this.emergency.checkPermission();
        });
      }
    });
  }

  async presentLoader()
  {
    const loader = await this.loadingController.create({
      spinner: 'dots',
      mode: 'ios',
      backdropDismiss: false,
    });

    await loader.present();
  }

  initSocket()
  {
    this.storage.get('userToken').then((userToken) => {
      if(userToken) {
        this.socket.join(userToken.userId);
      }
    });
  }

}

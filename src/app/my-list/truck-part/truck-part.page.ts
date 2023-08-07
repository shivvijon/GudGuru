import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/api/auth.service';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { ToastService } from 'src/app/services/api/toast.service';
import { TruckService } from 'src/app/services/api/truck.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-truck-part',
  templateUrl: './truck-part.page.html',
  styleUrls: ['./truck-part.page.scss'],
})
export class TruckPartPage implements OnInit {

  truckParts: any[] = [];
  isLoading: any;
  env = environment;
  socketSubs: Subscription;

  constructor(
    private api: TruckService,
    private alertController: AlertController,
    private toast: ToastService,
    public emergency: EmergencyLoadService,
    public userService: AuthService,
    private router: Router,
    private socket: SocketService
  ) { }

  ngOnInit() {}

  ionViewWillEnter()
  {
    this.getTruckParts();
    this.getTrialStatus();
    this.listenSocket();
  }

  getTruckParts()
  {
    this.isLoading = true;
    this.api.getUserTruckParts().subscribe((response: any) => {
      this.isLoading = false;
      console.log(response);
      this.truckParts = response.data;
    });
  }

  getTrialStatus()
  {
    this.userService.getTrialStatus().subscribe((resp) => {
      if(resp.success) {
        this.userService.isTrial = resp.isTrial;
        this.userService.subscriptionStatus = resp.subscriptionStatus;
        this.userService.daysLeft = resp.daysLeft;
      }
    });
  }

  async presentAlert(id: string)
  {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete this truck part sale?',
      cssClass: 'delete-alert',
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Delete',
          cssClass: 'btn-delete',
          handler: () => this.deleteTruckPart(id)
        },
        {
          text: 'Cancel',
          cssClass: 'btn-cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  deleteTruckPart(id: string)
  {
    this.isLoading = true;
    this.api.deleteTruckPart(id).subscribe(resp => {
      console.log(resp);
      if(resp.success)
      {
        this.getTruckParts();
        this.toast.presentToast(resp.msg, 'success');
      }
    },
    (err) => {
      console.log(err);
      this.isLoading = false;
      if(err.status !== 502) {
        this.toast.presentToast('Truck Part not found', 'danger');
      }
    });
  }

  navToNotifications()
  {
    if(!this.userService.isTrial && this.userService.user?.role === '0' &&
    (this.userService.subscriptionStatus === 'inactive' || this.userService.subscriptionStatus === 'past_due')) {
      this.userService.showPlanUpgrade();
    }
    else {
      this.router.navigate(['tabs/listing/notification']);
    }
  }

  navToUpdateTruckPart(truckData: any)
  {
    const navExtras: NavigationExtras = {
      // eslint-disable-next-line no-underscore-dangle
      state: {partId: truckData._id, truckData}
    };

    this.router.navigate(['tabs/listing/truck-part'], navExtras);
  }

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getTrialStatus();
    });
  }

  ionViewWillLeave() {
    this.socketSubs.unsubscribe();
  }

}

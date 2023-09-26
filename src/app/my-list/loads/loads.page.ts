import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/api/auth.service';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { LoadService } from 'src/app/services/api/load.service';
import { ToastService } from 'src/app/services/api/toast.service';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-loads',
  templateUrl: './loads.page.html',
  styleUrls: ['./loads.page.scss'],
})
export class LoadsPage implements OnInit {

  isLoading = true;
  loads: any[] = [];
  socketSubs: Subscription;

  constructor(
    private api: LoadService,
    private alertController: AlertController,
    private toast: ToastService,
    public emergency: EmergencyLoadService,
    public userService: AuthService,
    private router: Router,
    private socket: SocketService
  ) { }

  ngOnInit() {
    this.getUserLoads();
  }

  ionViewWillEnter() {
    this.getTrialStatus();
    this.listenSocket();
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

  getUserLoads()
  {
    this.api.getUserLoads().subscribe(resp => {
      console.log(resp);
      this.isLoading = false;
      this.loads = resp.data;
    },
    (err) => {
      console.log(err);
      this.isLoading = false;
    });
  }

  async presentAlert(id: string)
  {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete this load?',
      cssClass: 'delete-alert',
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Delete',
          cssClass: 'btn-delete',
          handler: () => this.deleteLoad(id)
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

  deleteLoad(id: string)
  {
    this.isLoading = true;
    this.api.deleteUserLoad(id).subscribe(resp => {
      console.log(resp);
      if(resp.success)
      {
        this.getUserLoads();
        this.toast.presentToast(resp.msg, 'success');
      }
    },
    (err) => {
      console.log(err);
      this.isLoading = false;
      if(err.status !== 502) {
        this.toast.presentToast('Load not found', 'danger');
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

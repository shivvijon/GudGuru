import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { LoadService } from '../services/api/load.service';
import { PaymentService } from '../services/api/payment.service';
import { ToastService } from '../services/api/toast.service';
import { PushService } from '../services/push-notification/push.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  loads: any[] = [];
  isLoading = true;
  level: any;
  errorMsg = '';

  constructor(
    private router: Router,
    private apiService: LoadService,
    private push: PushService,
    public location: Location,
    public emergency: EmergencyLoadService,
    public paymentService: PaymentService,
    private toast: ToastService,
    public api: AuthService
  )
  {
    push.clearNotifications();
  }

  ngOnInit() {
    this.getLevel();
  }

  getLoad()
  {
    this.apiService.getEmergencyLoads().subscribe((response: any) => {
      console.log(response);
      if(response.success) {
        this.loads = response.data;
      }
      else
      {
        this.errorMsg = response.data;
        if(this.errorMsg === 'Unable to fetch notifications') {
          this.toast.presentToast(this.errorMsg, 'danger');
        }
      }
      this.isLoading = false;
    },
    (err) => {
      this.isLoading = false;
      if(err.status !== 502)
      {
        this.errorMsg = 'Unable to fetch notifications';
      this.toast.presentToast(this.errorMsg, 'danger');
      }

      console.error(err);
    });
  }

  callLoad(contact: string)
  {
    const a = document.createElement('a');
    a.href = 'tel:' + contact;
    a.click();
  }

  getLevel()
  {
    this.isLoading = true;
    this.paymentService.getLevel().subscribe(resp => {
      console.log(resp);
      this.level=resp.level;
      this.getTrialStatus();
    },
    (err) => {
      this.isLoading = false;
      console.error(err);

    });
  }

  getTrialStatus()
  {
    this.api.getTrialStatus().subscribe((resp) => {
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;
        this.getLoad();
      }
    });
  }

  plan(){
    this.router.navigate(['/tabs/profile/plans']);
  }

}

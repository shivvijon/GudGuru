import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/api/auth.service';
import { EmergencyLoadService } from '../services/api/emergency-load.service';

@Component({
  selector: 'app-my-list',
  templateUrl: './my-list.page.html',
  styleUrls: ['./my-list.page.scss'],
})
export class MyListPage implements OnInit {

  isLoading: boolean;

  constructor(
    public emergency: EmergencyLoadService,
    public api: AuthService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getTrialStatus();
  }

  getTrialStatus()
  {
    this.isLoading = true;
    this.api.getTrialStatus().subscribe((resp) => {
      this.isLoading = false;
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;
      }
    });
  }

}

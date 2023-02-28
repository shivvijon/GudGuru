import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { ToastService } from '../services/api/toast.service';
import { PushService } from '../services/push-notification/push.service';
import { AuthService } from '../services/api/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    public location: Location,
    public emergency: EmergencyLoadService,
    public push: PushService,
    public api: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit() {
  }



}

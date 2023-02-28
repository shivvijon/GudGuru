import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/api/auth.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
})
export class EmailVerifyComponent implements OnInit {

  modalInitialBr = 1;

  constructor(public userService: AuthService, private router: Router,) { }

  ngOnInit() {}

  emailOtpRedirect() {
    this.userService.isEmailModalOpen = false;
    this.router.navigate(['email-otp']);
  }
}

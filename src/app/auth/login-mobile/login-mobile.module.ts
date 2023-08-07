import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginMobilePageRoutingModule } from './login-mobile-routing.module';

import { LoginMobilePage } from './login-mobile.page';
import { NgOtpInputModule } from  'ng-otp-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    LoginMobilePageRoutingModule
  ],
  declarations: [LoginMobilePage]
})
export class LoginMobilePageModule {}

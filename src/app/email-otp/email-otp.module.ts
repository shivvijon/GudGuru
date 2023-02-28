import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmailOtpPageRoutingModule } from './email-otp-routing.module';

import { EmailOtpPage } from './email-otp.page';
import { NgOtpInputModule } from  'ng-otp-input';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    EmailOtpPageRoutingModule
  ],
  declarations: [EmailOtpPage]
})
export class EmailOtpPageModule {}

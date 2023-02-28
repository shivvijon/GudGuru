import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmailOtpPage } from './email-otp.page';

const routes: Routes = [
  {
    path: '',
    component: EmailOtpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailOtpPageRoutingModule {}

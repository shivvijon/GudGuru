import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginOptPageRoutingModule } from './login-opt-routing.module';

import { LoginOptPage } from './login-opt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginOptPageRoutingModule
  ],
  declarations: [LoginOptPage]
})
export class LoginOptPageModule {}

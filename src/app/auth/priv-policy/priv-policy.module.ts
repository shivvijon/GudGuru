import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivPolicyPageRoutingModule } from './priv-policy-routing.module';

import { PrivPolicyPage } from './priv-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivPolicyPageRoutingModule
  ],
  declarations: [PrivPolicyPage]
})
export class PrivPolicyPageModule {}

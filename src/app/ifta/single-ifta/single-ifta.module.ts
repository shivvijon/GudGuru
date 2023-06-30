import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SingleIftaPageRoutingModule } from './single-ifta-routing.module';

import { SingleIftaPage } from './single-ifta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SingleIftaPageRoutingModule
  ],
  declarations: [SingleIftaPage]
})
export class SingleIftaPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckPartDetailsPageRoutingModule } from './truck-part-details-routing.module';

import { TruckPartDetailsPage } from './truck-part-details.page';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwiperModule,
    TruckPartDetailsPageRoutingModule
  ],
  declarations: [TruckPartDetailsPage]
})
export class TruckPartDetailsPageModule {}

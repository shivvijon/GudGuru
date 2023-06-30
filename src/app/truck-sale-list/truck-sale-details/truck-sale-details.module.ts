import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckSaleDetailsPageRoutingModule } from './truck-sale-details-routing.module';

import { TruckSaleDetailsPage } from './truck-sale-details.page';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckSaleDetailsPageRoutingModule,
    SwiperModule
  ],
  declarations: [TruckSaleDetailsPage]
})
export class TruckSaleDetailsPageModule {}

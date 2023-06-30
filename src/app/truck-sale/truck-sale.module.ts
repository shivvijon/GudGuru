import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckSalePageRoutingModule } from './truck-sale-routing.module';

import { TruckSalePage } from './truck-sale.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckSalePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TruckSalePage]
})
export class TruckSalePageModule {}

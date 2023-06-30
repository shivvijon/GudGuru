import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckSaleListPageRoutingModule } from './truck-sale-list-routing.module';

import { TruckSaleListPage } from './truck-sale-list.page';
import { TruckFilterComponent } from '../truck-filter/truck-filter.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TruckSaleListPageRoutingModule,
    ScrollingModule
  ],
  declarations: [TruckSaleListPage, TruckFilterComponent]
})
export class TruckSaleListPageModule {}

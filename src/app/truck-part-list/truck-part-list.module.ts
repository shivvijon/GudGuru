import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckPartListPageRoutingModule } from './truck-part-list-routing.module';

import { TruckPartListPage } from './truck-part-list.page';
import { TruckPartFilterComponent } from '../truck-part-filter/truck-part-filter.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ScrollingModule,
    TruckPartListPageRoutingModule
  ],
  declarations: [TruckPartListPage, TruckPartFilterComponent]
})
export class TruckPartListPageModule {}

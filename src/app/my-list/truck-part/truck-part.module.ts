import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckPartPageRoutingModule } from './truck-part-routing.module';

import { TruckPartPage } from './truck-part.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckPartPageRoutingModule
  ],
  declarations: [TruckPartPage]
})
export class TruckPartPageModule {}

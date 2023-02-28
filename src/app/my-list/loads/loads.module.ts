import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadsPageRoutingModule } from './loads-routing.module';

import { LoadsPage } from './loads.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadsPageRoutingModule
  ],
  declarations: [LoadsPage]
})
export class LoadsPageModule {}

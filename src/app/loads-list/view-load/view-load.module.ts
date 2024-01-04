import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewLoadPageRoutingModule } from './view-load-routing.module';

import { ViewLoadPage } from './view-load.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewLoadPageRoutingModule
  ],
  declarations: [ViewLoadPage]
})
export class ViewLoadPageModule {}

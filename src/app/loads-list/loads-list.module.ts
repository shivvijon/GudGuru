import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadsListPageRoutingModule } from './loads-list-routing.module';

import { LoadsListPage } from './loads-list.page';
import { LocationComponent } from '../location/location.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LoadsListPageRoutingModule,

  ],
  declarations: [LoadsListPage, LocationComponent]
})
export class LoadsListPageModule {}

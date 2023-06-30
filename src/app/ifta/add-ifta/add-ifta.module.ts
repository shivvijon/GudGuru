import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddIftaPageRoutingModule } from './add-ifta-routing.module';

import { AddIftaPage } from './add-ifta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AddIftaPageRoutingModule
  ],
  declarations: [AddIftaPage]
})
export class AddIftaPageModule {}

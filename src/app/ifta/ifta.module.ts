import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IftaPageRoutingModule } from './ifta-routing.module';

import { IftaPage } from './ifta.page';
import { IftaFilterComponent } from './ifta-filter/ifta-filter.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    IftaPageRoutingModule,
    ScrollingModule
  ],
  declarations: [IftaPage, IftaFilterComponent]
})
export class IftaPageModule {}

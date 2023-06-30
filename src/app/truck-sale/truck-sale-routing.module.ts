import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckSalePage } from './truck-sale.page';

const routes: Routes = [
  {
    path: '',
    component: TruckSalePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckSalePageRoutingModule {}

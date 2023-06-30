import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckSaleDetailsPage } from './truck-sale-details.page';

const routes: Routes = [
  {
    path: '',
    component: TruckSaleDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckSaleDetailsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckPartDetailsPage } from './truck-part-details.page';

const routes: Routes = [
  {
    path: '',
    component: TruckPartDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckPartDetailsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckPartPage } from './truck-part.page';

const routes: Routes = [
  {
    path: '',
    component: TruckPartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckPartPageRoutingModule {}

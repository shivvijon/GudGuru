import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckSaleListPage } from './truck-sale-list.page';
import { TruckSaleDetailsPage } from './truck-sale-details/truck-sale-details.page';

const routes: Routes = [
  {
    path: '',
    component: TruckSaleListPage
  },
  {
    path: 'truck-sale-details',
    loadChildren: () => import('./truck-sale-details/truck-sale-details.module').then( m => m.TruckSaleDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckSaleListPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyListPage } from './my-list.page';

const routes: Routes = [
  {
    path: '',
    component: MyListPage
  },
  {
    path: 'loads',
    loadChildren: () => import('./loads/loads.module').then( m => m.LoadsPageModule)
  },
  {
    path: 'truck-sale',
    loadChildren: () => import('./truck-sale/truck-sale.module').then( m => m.TruckSalePageModule)
  },
  {
    path: 'truck-part',
    loadChildren: () => import('./truck-part/truck-part.module').then( m => m.TruckPartPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyListPageRoutingModule {}

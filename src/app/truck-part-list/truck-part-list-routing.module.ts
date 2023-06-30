import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckPartListPage } from './truck-part-list.page';

const routes: Routes = [
  {
    path: '',
    component: TruckPartListPage
  },
  {
    path: 'truck-part-details',
    loadChildren: () => import('./truck-part-details/truck-part-details.module').then( m => m.TruckPartDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckPartListPageRoutingModule {}

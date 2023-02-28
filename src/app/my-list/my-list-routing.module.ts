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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyListPageRoutingModule {}

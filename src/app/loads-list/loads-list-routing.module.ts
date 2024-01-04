import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadsListPage } from './loads-list.page';

const routes: Routes = [
  {
    path: '',
    component: LoadsListPage
  },
  {
    path: 'view-load',
    loadChildren: () => import('./view-load/view-load.module').then( m => m.ViewLoadPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadsListPageRoutingModule {}

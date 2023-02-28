import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadsListPage } from './loads-list.page';

const routes: Routes = [
  {
    path: '',
    component: LoadsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadsListPageRoutingModule {}

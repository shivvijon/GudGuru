import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadsPage } from './loads.page';

const routes: Routes = [
  {
    path: '',
    component: LoadsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadsPageRoutingModule {}

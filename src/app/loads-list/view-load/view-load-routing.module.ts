import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewLoadPage } from './view-load.page';

const routes: Routes = [
  {
    path: '',
    component: ViewLoadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewLoadPageRoutingModule {}

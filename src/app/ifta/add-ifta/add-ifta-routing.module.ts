import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddIftaPage } from './add-ifta.page';

const routes: Routes = [
  {
    path: '',
    component: AddIftaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddIftaPageRoutingModule {}

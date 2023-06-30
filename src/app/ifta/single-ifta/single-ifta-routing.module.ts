import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleIftaPage } from './single-ifta.page';

const routes: Routes = [
  {
    path: '',
    component: SingleIftaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleIftaPageRoutingModule {}

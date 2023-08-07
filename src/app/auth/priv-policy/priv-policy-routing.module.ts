import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivPolicyPage } from './priv-policy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivPolicyPageRoutingModule {}

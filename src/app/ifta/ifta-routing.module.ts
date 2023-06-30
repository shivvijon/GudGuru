import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IftaPage } from './ifta.page';

const routes: Routes = [
  {
    path: '',
    component: IftaPage
  },
  {
    path: 'single-ifta',
    loadChildren: () => import('./single-ifta/single-ifta.module').then( m => m.SingleIftaPageModule)
  },
  {
    path: 'add-ifta',
    loadChildren: () => import('./add-ifta/add-ifta.module').then( m => m.AddIftaPageModule)
  },
  {
    path: 'report',
    loadChildren: () => import('./report/report.module').then( m => m.ReportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IftaPageRoutingModule {}

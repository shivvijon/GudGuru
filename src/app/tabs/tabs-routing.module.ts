import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then( m => m.HomePageModule)
          },
          {
            path: 'loadsList',
            loadChildren: () => import('../loads-list/loads-list.module').then( m => m.LoadsListPageModule)
          },
          {
            path: 'truckList',
            loadChildren: () => import('../truck-sale-list/truck-sale-list.module').then( m => m.TruckSaleListPageModule)
          },
          {
            path: 'truckPartList',
            loadChildren: () => import('../truck-part-list/truck-part-list.module').then( m => m.TruckPartListPageModule)
          },
          {
            path: 'ifta',
            loadChildren: () => import('../ifta/ifta.module').then( m => m.IftaPageModule)
          },
          {
            path: 'notification',
            loadChildren: () => import('../notification/notification.module').then( m => m.NotificationPageModule)
          }
        ]
      },
      /* {
        path: 'emergency',
        loadChildren: () => import('../home/home.module').then( m => m.HomePageModule)
      }, */
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
          },
          /* {
            path: 'plans',
            loadChildren: () => import('../plans/plans.module').then(m => m.PlansPageModule)
          }, */
          {
            path: 'notification',
            loadChildren: () => import('../notification/notification.module').then( m => m.NotificationPageModule)
          },
          {
            path: 'payment',
            loadChildren: () => import('../payment/payment.module').then( m => m.PaymentPageModule)
          },
          {
            path: 'thanks',
            loadChildren: () => import('../thanks/thanks.module').then( m => m.ThanksPageModule),
          },
        ]
      },
      {
        path: 'listing',
        children: [
          {
            path: '',
            loadChildren: () => import('../listing/listing.module').then( m => m.ListingPageModule)
          },
          {
            path: 'loads',
            loadChildren: () => import('../loads/loads.module').then( m => m.LoadsPageModule)
          },
          {
            path: 'truck-sale',
            loadChildren: () => import('../truck-sale/truck-sale.module').then( m => m.TruckSalePageModule)
          },
          {
            path: 'truck-part',
            loadChildren: () => import('../truck-part/truck-part.module').then( m => m.TruckPartPageModule)
          },
          {
            path: 'my-list',
            loadChildren: () => import('../my-list/my-list.module').then( m => m.MyListPageModule)
          },
          {
            path: 'ifta',
            loadChildren: () => import('../ifta/ifta.module').then( m => m.IftaPageModule)
          },
          {
            path: 'notification',
            loadChildren: () => import('../notification/notification.module').then( m => m.NotificationPageModule)
          }
        ]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

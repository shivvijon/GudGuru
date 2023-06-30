import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'email-otp',
    loadChildren: () => import('./email-otp/email-otp.module').then( m => m.EmailOtpPageModule)
  },
  {
    path: 'policy',
    loadChildren: () => import('./priv-policy/priv-policy.module').then( m => m.PrivPolicyPageModule)
  },
  {
    path: 'plan',
    loadChildren: () => import('./plans/plans.module').then(m => m.PlansPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then(m => m.PaymentPageModule)
  },
  {
    path: 'thanks',
    loadChildren: () => import('./thanks/thanks.module').then(m => m.ThanksPageModule)
  },
  {
    path: 'ifta',
    loadChildren: () => import('./ifta/ifta.module').then( m => m.IftaPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

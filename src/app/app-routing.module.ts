import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'login-opt',
    loadChildren: () => import('./auth/login-opt/login-opt.module').then( m => m.LoginOptPageModule)
  },
  {
    path: 'login-mobile',
    loadChildren: () => import('./auth/login-mobile/login-mobile.module').then( m => m.LoginMobilePageModule)
  },
  {
    path: 'login-email',
    loadChildren: () => import('./auth/login-email/login-email.module').then( m => m.LoginEmailPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then( m => m.RegisterPageModule)
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
    loadChildren: () => import('./auth/priv-policy/priv-policy.module').then( m => m.PrivPolicyPageModule)
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
    path: 'password-reset',
    loadChildren: () => import('./auth/password-reset/password-reset.module').then( m => m.PasswordResetPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

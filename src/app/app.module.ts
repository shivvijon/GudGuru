import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AuthInterceptor } from './services/http-interceptors/auth.interceptor';
import { StateComponent } from './modals/state/state.component';
import { CityComponent } from './modals/city/city.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { EmergencyLoadComponent } from './emergency-load/emergency-load.component';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { UnauthInterceptor } from './services/http-interceptors/unauth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { NetworkStatusInterceptor } from './services/http-interceptors/network-status.interceptor';
import { EmailVerifyComponent } from './email-verify/email-verify.component';
import { Stripe } from '@awesome-cordova-plugins/stripe/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@NgModule({
  declarations: [AppComponent, StateComponent, CityComponent, EmergencyLoadComponent, EmailVerifyComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ScrollingModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleAPIKey
    })
  ],
  providers: [
    LocationAccuracy, NativeGeocoder, AndroidPermissions, Diagnostic, Stripe, InAppPurchase2, InAppBrowser,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: NetworkStatusInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthInterceptor, multi: true },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  static injector: Injector;
  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { LogoutService } from '../api/logout.service';
import { ToastService } from '../api/toast.service';
import { StorageService } from '../storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private storage: StorageService,
    private api: LogoutService,
    private toast: ToastService,
    private jwt: JwtHelperService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    return await this.checkToken();
  }

  async checkToken(): Promise<boolean>
  {
    const token = await this.storage.get('userToken');

    if(token)
    {
      if(this.jwt.isTokenExpired(token.token)) {
        return this.logout();
      }
      else if(token.isSubscribed) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return this.logout();
    }
  }

  logout(): boolean
  {
    this.api.logout();
    this.toast.presentToast('Session Expired. Please login again.', 'danger');
    return false;
  }

}

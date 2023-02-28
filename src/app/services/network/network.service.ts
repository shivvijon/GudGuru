import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(null);
  status$ = this.status.asObservable();

  constructor()
  {
    Network.addListener('networkStatusChange', (status) => {
      this.status.next(status);
    });

    Network.getStatus().then((status) => this.status.next(status));
  }
}

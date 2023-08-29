import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LoadService } from '../services/api/load.service';
import { mergeMap, switchMap } from 'rxjs/operators';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import {  PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';
import { SocketService } from '../services/socket/socket.service';
import { Subscription } from 'rxjs';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-loads-list',
  templateUrl: './loads-list.page.html',
  styleUrls: ['./loads-list.page.scss'],
})
export class LoadsListPage implements OnInit, OnDestroy {

  location: any;
  loads: any[] = [];
  originalLoads: any[] = [];
  isLoading = false;
  level: any;
  isEmLoading: boolean;
  openLocation = false;
  clearLocation = false;
  socketSubs: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: LoadService,
    public emergency: EmergencyLoadService,
    public paymentService: PaymentService,
    public api: AuthService,
    private modalController: ModalController,
    private socket: SocketService
  )
  {
    /* route.queryParams.subscribe(param => {
      if(router.getCurrentNavigation().extras.state?.location) {
        this.location = router.getCurrentNavigation().extras.state.location;
        this.getLoad();
      }
    }); */
  }

  ngOnInit()
  {
    this.getLoad();
    this.getLevel();
    this.listenSocket();
  }

  getLoad()
  {
    this.isLoading = true;
    this.apiService.getLoads().subscribe((response: any) => {
      console.log(response);
      if(response.success && this.location)
      {
        const location = JSON.parse(JSON.stringify(this.location));
        for(const key in location)
        {
          if((key === 'fromState' || key === 'toState') && location[key] === 'All') {
            delete location[key];
          }
          else if((key === 'fromCity' || key === 'toCity') && location[key].includes('All')) {
            delete location[key];
          }
        }

        this.originalLoads = response.data.filter(loadData => {
          for(const key in location)
          {
            if(key === 'fromState' && loadData.from.state === location.fromState) {
              continue;
            }
            else if(key === 'toState' && loadData.to.state === location.toState) {
              continue;
            }
            else if(key === 'fromCity' && location.fromCity.includes(loadData.from.city)) {
              continue;
            }
            else if(key === 'toCity' && location.toCity.includes(loadData.to.city)) {
              continue;
            }
            else {
              return false;
            }
          }

          return true;
        });
      }
      else {
        this.originalLoads = response.data;
      }

      this.loads = this.originalLoads.slice(0, 20);
      this.isLoading = false;
    },
    (err) => {
      this.isLoading = false;
      console.error(err);
    });
  }

  callLoad(contact: string)
  {
    const a = document.createElement('a');
    a.href = 'tel:' + contact;
    a.click();
  }

  plan() {
    /* this.router.navigate(['/tabs/profile/plans']); */
    this.api.showPlanUpgrade();
  }

  getLevel()
  {
    this.isEmLoading = true;
    this.paymentService.getLevel().subscribe(resp => {
      console.log(resp);
      this.level=resp.level;
      this.getTrialStatus();
    },
    (err) => {
      this.isEmLoading = false;
      console.error(err);

    });
  }

  getTrialStatus()
  {
    this.api.getTrialStatus().subscribe((resp) => {
      this.isEmLoading = false;
      if(resp.success) {
        this.api.isTrial = resp.isTrial;
        this.api.subscriptionStatus = resp.subscriptionStatus;
        this.api.daysLeft = resp.daysLeft;
      }
    });
  }

  async openLocationModal()
  {
    this.openLocation = true;
    this.clearLocation = true;
  }

  getLoadLocation(locationData)
  {
    this.location = locationData;
    console.log(locationData);
    this.openLocation = false;
    this.clearLocation = false;

    this.modalController.dismiss().then(() => {
      if(this.location) {
        this.getLoad();
      }
    });
  }

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getLevel();
    });
  }

  fetchNextLoads()
  {
    if((this.loads.length + 20) < this.originalLoads.length) {
      this.loads = this.loads.concat(this.originalLoads.slice(this.loads.length, this.loads.length + 20));
    }
    else {
      this.loads = this.loads.concat(this.originalLoads.slice(this.loads.length));
    }
  }

  onIonInfinite(ev)
  {
    this.fetchNextLoads();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
      if(this.loads.length === this.originalLoads.length) {
        ev.target.disabled = true;
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.socketSubs.unsubscribe();
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadService } from '../services/api/load.service';
import { mergeMap, switchMap } from 'rxjs/operators';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import {  PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';
import { SocketService } from '../services/socket/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loads-list',
  templateUrl: './loads-list.page.html',
  styleUrls: ['./loads-list.page.scss'],
})
export class LoadsListPage implements OnInit, OnDestroy {

  location: any;
  loads: any[] = [];
  isLoading = true;
  level: any;
  isEmLoading: boolean;
  socketSubs: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: LoadService,
    public emergency: EmergencyLoadService,
    public paymentService: PaymentService,
    public api: AuthService,
    private socket: SocketService
  )
  {
    route.queryParams.subscribe(param => {
      if(router.getCurrentNavigation().extras.state?.location) {
        this.location = router.getCurrentNavigation().extras.state.location;
        this.getLoad();
      }
    });
  }

  ngOnInit() {
    this.getLevel();
    this.listenSocket();
  }

  getLoad()
  {
    this.apiService.getLoads().subscribe((response: any) => {
      console.log(response);
      if(response.success)
      {
        if(this.location.fromCity.includes('All') && this.location.toState === 'All' && this.location.toCity.includes('All')) {
          this.loads = response.data.filter(loadData =>
            (loadData.isblock === false &&
            loadData.from.state === this.location.fromState));
        }
        else if(this.location.fromCity.includes('All') && this.location.toCity.includes('All')) {
          this.loads = response.data.filter(loadData =>
            (loadData.isblock === false &&
            loadData.from.state === this.location.fromState &&
            loadData.to.state === this.location.toState));
        }
        else if(!this.location.toCity.includes('All') && this.location.fromCity.includes('All')) {
          this.loads = response.data.filter(loadData =>
            (loadData.isblock === false &&
            loadData.from.state === this.location.fromState &&
            loadData.to.state === this.location.toState &&
            this.location.toCity.includes(loadData.to.city)));
        }
        else if(this.location.toCity.includes('All') && !this.location.fromCity.includes('All')) {
          this.loads = response.data.filter(loadData =>
            (loadData.isblock === false &&
            loadData.from.state === this.location.fromState &&
            loadData.to.state === this.location.toState &&
            this.location.fromCity.includes(loadData.from.city)));
        }
        else {
          this.loads = response.data.filter(loadData =>
            (loadData.isblock === false &&
            loadData.from.state === this.location.fromState &&
            this.location.fromCity.includes(loadData.from.city) &&
            loadData.to.state === this.location.toState &&
            this.location.toCity.includes(loadData.to.city)));
        }
      }
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

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getLevel();
    });
  }

  ngOnDestroy(): void {
    this.socketSubs.unsubscribe();
  }

}

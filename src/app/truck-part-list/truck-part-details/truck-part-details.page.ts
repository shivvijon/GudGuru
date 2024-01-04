import { AfterContentChecked, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/api/auth.service';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { TruckService } from 'src/app/services/api/truck.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

@Component({
  selector: 'app-truck-part-details',
  templateUrl: './truck-part-details.page.html',
  styleUrls: ['./truck-part-details.page.scss'],
})
export class TruckPartDetailsPage implements OnInit, OnDestroy, AfterContentChecked {

  @ViewChild('swiperCont') swiper: SwiperComponent;

  partId: string;
  truckPart: any;
  isLoading: boolean;
  showContact: boolean;
  swiperOptions: SwiperOptions = {
    slidesPerView: 1,
    centeredSlides: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: {
      clickable: true
    }
  };
  env = environment;
  socketSubs: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public emergency: EmergencyLoadService,
    public api: TruckService,
    private auth: AuthService,
    private socket: SocketService
  )
  {
    route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state)
      {
        this.partId = this.router.getCurrentNavigation().extras.state.partId;
        this.getTrialStatus();
      }
    });
  }

  ngOnInit() {
    this.listenSocket();
  }

  ngAfterContentChecked(): void {
    if(this.swiper) {
      this.swiper.swiperRef.autoplay.running = true;
    }
  }

  getTruckPartDetails()
  {
    this.api.getTruckPart(this.partId).subscribe(response => {
      this.isLoading = false;
      console.log(response);
      this.truckPart = response.data;
    });
  }

  callLoad(contact: string)
  {
    const a = document.createElement('a');
    a.href = 'tel:' + contact;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) ?
    a.click() : a.click();

    /* (!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) ?
    this.auth.showPlanUpgrade() : a.click(); */
  }

  navToNotifications()
  {
    if(!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) {
      // this.auth.showPlanUpgrade();
      this.router.navigate(['tabs/listing/notification']);
    }
    else {
      this.router.navigate(['tabs/listing/notification']);
    }
  }

  getTrialStatus()
  {
    this.isLoading = true;
    this.auth.getTrialStatus().subscribe((resp) => {
      if(resp.success) {
        this.getTruckPartDetails();
        this.auth.isTrial = resp.isTrial;
        this.auth.subscriptionStatus = resp.subscriptionStatus;
        this.auth.daysLeft = resp.daysLeft;

        this.showContact = ((!this.auth.isTrial && this.auth.user?.role === '0' &&
          (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due'))) ?
          false : true;
      }
    });
  }

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getTrialStatus();
    });
  }

  ngOnDestroy(): void {
    this.socketSubs.unsubscribe();
  }

}

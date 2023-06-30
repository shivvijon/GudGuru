import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/api/auth.service';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { TruckService } from 'src/app/services/api/truck.service';
import { environment } from 'src/environments/environment';
import Swiper, { Autoplay, Pagination, SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
Swiper.use([Autoplay, Pagination]);

@Component({
  selector: 'app-truck-sale-details',
  templateUrl: './truck-sale-details.page.html',
  styleUrls: ['./truck-sale-details.page.scss'],
})
export class TruckSaleDetailsPage implements OnInit, AfterContentChecked {

  @ViewChild('swiperCont') swiper: SwiperComponent;

  truckId: string;
  truck: any;
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public emergency: EmergencyLoadService,
    public api: TruckService,
    private auth: AuthService,
    private loadingController: LoadingController
  )
  {
    route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state)
      {
        this.truckId = this.router.getCurrentNavigation().extras.state.truckId;
        this.getTrialStatus();
      }
    });
  }

  ngOnInit() {
  }

  ngAfterContentChecked(): void {
    if(this.swiper) {
      this.swiper.swiperRef.autoplay.running = true;
    }
  }

  getTruckDetails()
  {
    this.isLoading = true;
    this.api.getTruck(this.truckId).subscribe(response => {
      this.isLoading = false;
      console.log(response);
      this.truck = response.data;
    });
  }

  callLoad(contact: string)
  {
    const a = document.createElement('a');
    a.href = 'tel:' + contact;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) ?
    this.auth.showPlanUpgrade() : a.click();
  }

  navToNotifications()
  {
    if(!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) {
      this.auth.showPlanUpgrade();
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
        this.getTruckDetails();
        this.auth.isTrial = resp.isTrial;
        this.auth.subscriptionStatus = resp.subscriptionStatus;
        this.auth.daysLeft = resp.daysLeft;

        this.showContact = ((!this.auth.isTrial && this.auth.user?.role === '0' &&
          (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due'))) ?
          false : true;
      }
    });
  }

}

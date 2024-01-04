import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { FuelService } from 'src/app/services/api/fuel.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {

  reportFilter: any;
  fuelRefills: any[] = [];
  totalMiles: any;
  totalGallons: any;
  quarter: string;

  constructor(
    private router: Router,
    public emergency: EmergencyLoadService,
    public api: FuelService,
    private auth: AuthService,
    private route: ActivatedRoute
  )
  {
    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state)
      {
        this.reportFilter = router.getCurrentNavigation().extras.state.reportFilter;
        this.fuelRefills = router.getCurrentNavigation().extras.state.filteredFuelRefills;
        this.totalMiles = router.getCurrentNavigation().extras.state.totalMiles;
        this.totalGallons = router.getCurrentNavigation().extras.state.totalGallons;

        if(this.reportFilter.quarter && this.reportFilter.quarter === 'Q1') {
          this.quarter = 'Q1 Jan, Feb & Mar';
        }
        else if(this.reportFilter.quarter && this.reportFilter.quarter === 'Q2') {
          this.quarter = 'Q2 Apr, May & Jun';
        }
        else if(this.reportFilter.quarter && this.reportFilter.quarter === 'Q3') {
          this.quarter = 'Q3 Jul, Aug & Sep';
        }
        else if(this.reportFilter.quarter && this.reportFilter.quarter === 'Q4') {
          this.quarter = 'Q4 Oct, Nov & Dec';
        }
      }
    });
  }

  ngOnInit() {
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

}

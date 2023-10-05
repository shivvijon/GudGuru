import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { TruckService } from '../services/api/truck.service';
import { AuthService } from '../services/api/auth.service';
import { PaymentService } from '../services/api/payment.service';

@Component({
  selector: 'app-truck-part-list',
  templateUrl: './truck-part-list.page.html',
  styleUrls: ['./truck-part-list.page.scss'],
})
export class TruckPartListPage implements OnInit {

  truckParts: any[] = [];
  filteredParts: any[] = [];
  isLoading: any;
  openFilter = false;
  clearFilter = false;
  level: any;
  env = environment;

  constructor(
    private router: Router,
    public emergency: EmergencyLoadService,
    public paymentService: PaymentService,
    public api: TruckService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getLevel();
    this.getTruckParts();
  }

  ionViewWillEnter() {}

  getLevel()
  {
    this.paymentService.getLevel().subscribe(resp => {
      console.log(resp);
      this.level = resp.level;
    },
    (err) => {
      console.error(err);
    });
  }

  getTruckParts()
  {
    this.isLoading = true;
    this.api.getTruckParts().subscribe((response: any) => {
      this.isLoading = false;
      console.log(response);
      this.truckParts = response.data;
      this.filteredParts = Array.from(this.truckParts);
    });
  }

  async openFilterModal()
  {
    this.openFilter = true;
    this.clearFilter = true;
  }

  async getFilteredTruckParts(filterData) {
    const filter = filterData;
    const addedFilter: any = {};
    console.log(filterData);
    this.openFilter = false;
    this.clearFilter = false;

    for(const key in filter) {
      if(filter[key]) {
        addedFilter[key] = filter[key];
      }
    }

    // Check Year Data
    addedFilter.year = {min: null, max: null};
    if(addedFilter.minYear) {
      addedFilter.year.min = parseFloat(addedFilter.minYear);
    }
    if(addedFilter.maxYear) {
      addedFilter.year.max = parseFloat(addedFilter.maxYear);
    }
    delete addedFilter.minYear; delete addedFilter.maxYear;

    if(!addedFilter.year.min && !addedFilter.year.max) {
      delete addedFilter.year;
    }

    //console.log(addedFilter);

    if(filter)
    {
      if(filter.state.includes('All') || !filter.state.length)
      {
        delete addedFilter.state;
        this.filteredParts = this.truckParts.filter((truck) => {
          // Compare all Keys based on AND condition
          for(const key in addedFilter)
          {
            if(key === 'year' && (addedFilter[key].min && addedFilter[key].max &&
              (addedFilter[key].min <= parseFloat(truck[key]) && parseFloat(truck[key]) <= addedFilter[key].max)) ||
              (addedFilter[key].min && addedFilter[key].max == null && addedFilter[key].min <= parseFloat(truck[key])) ||
              (addedFilter[key].max && addedFilter[key].min == null && addedFilter[key].max >= parseFloat(truck[key]))) {
              continue;
            }
            else if(truck[key] === addedFilter[key]) {
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
        this.filteredParts = this.truckParts.filter((truck) => {
          // Compare all Keys based on AND condition
          for(const key in addedFilter)
          {
            if(key === 'year' && (addedFilter[key].min && addedFilter[key].max &&
              (addedFilter[key].min <= parseFloat(truck[key]) && parseFloat(truck[key]) <= addedFilter[key].max)) ||
              (addedFilter[key].min && addedFilter[key].max == null && addedFilter[key].min <= parseFloat(truck[key])) ||
              (addedFilter[key].max && addedFilter[key].min == null && addedFilter[key].max >= parseFloat(truck[key]))) {
              continue;
            }
            else if(key === 'state' && addedFilter[key].includes(truck[key])) {
              continue;
            }
            else if(truck[key] === addedFilter[key]) {
              continue;
            }
            else {
              return false;
            }
          }

          return true;
        });
      }
    }
    else {
      this.filteredParts = Array.from(this.truckParts);
    }
  }

  viewTruck(partId: string)
  {
    const navExtras: NavigationExtras = {
      state: {partId}
    };

    this.router.navigate(['tabs/home/truckPartList/truck-part-details'], navExtras);
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

}

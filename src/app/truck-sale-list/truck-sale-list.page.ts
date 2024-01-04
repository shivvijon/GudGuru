import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { AuthService } from '../services/api/auth.service';
import { TruckService } from '../services/api/truck.service';
import { environment } from 'src/environments/environment';
import { PaymentService } from '../services/api/payment.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-truck-sale-list',
  templateUrl: './truck-sale-list.page.html',
  styleUrls: ['./truck-sale-list.page.scss'],
})
export class TruckSaleListPage implements OnInit {

  trucks: any[] = [];
  filteredTrucks: any[] = [];
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
    this.getTrucks();
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

  getTrucks()
  {
    this.isLoading = true;
    this.api.getTrucks().subscribe((response: any) => {
      this.isLoading = false;
      console.log(response);
      this.trucks = response.data;
      this.filteredTrucks = Array.from(this.trucks.slice(0,20));
    });
  }

  async openFilterModal()
  {
    this.openFilter = true;
    this.clearFilter = true;
  }

  async getFilteredTrucks(filterData)
  {
    const filter = filterData;
    const addedFilter: any = {};
    console.log(filterData);
    this.openFilter = false;
    this.clearFilter = false;

    for(const key in filter) {
      if((key === 'minMiles' && filter[key] === 0) || filter[key]) {
        addedFilter[key] = filter[key];
      }
    }

    // Check Miles Data
    addedFilter.miles = {min: null, max: null};
    if((addedFilter.minMiles || addedFilter.minMiles === 0)) {
      addedFilter.miles.min = addedFilter.minMiles;
    }
    if(addedFilter.maxMiles) {
      addedFilter.miles.max = addedFilter.maxMiles;
    }
    delete addedFilter.minMiles; delete addedFilter.maxMiles;

    if((addedFilter.miles.min == null) && !addedFilter.miles.max) {
      delete addedFilter.miles;
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

    // Check Price Data
    if(!addedFilter.price?.min && !addedFilter.price?.max) {
      delete addedFilter.price;
    }

    console.log(addedFilter);

    if(filter)
    {
      if(filter.city.includes('All') || !filter.city.length)
      {
        delete addedFilter.city;
        this.filteredTrucks = this.trucks.filter((truck) => {

          for(const key in addedFilter)
          {
            if((key === 'miles' || key === 'price' || key === 'year') && (addedFilter[key].min && addedFilter[key].max &&
              (addedFilter[key].min <= parseFloat(truck[key]) && parseFloat(truck[key]) <= addedFilter[key].max)) ||
              ((addedFilter[key].min || addedFilter[key].min === 0) && addedFilter[key].max == null &&
                addedFilter[key].min <= parseFloat(truck[key])) ||
              (addedFilter[key].max && (addedFilter[key].min == null || addedFilter[key].min === 0) &&
                addedFilter[key].max >= parseFloat(truck[key]))) {
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
        this.filteredTrucks = this.trucks.filter((truck) => {
          for(const key in addedFilter)
          {
            if((key === 'miles' || key === 'price' || key === 'year') && (addedFilter[key].min && addedFilter[key].max &&
              (addedFilter[key].min <= parseFloat(truck[key]) && parseFloat(truck[key]) <= addedFilter[key].max)) ||
              ((addedFilter[key].min || addedFilter[key].min === 0) && addedFilter[key].max == null &&
                addedFilter[key].min <= parseFloat(truck[key])) ||
              (addedFilter[key].max && (addedFilter[key].min == null || addedFilter[key].min === 0) &&
                addedFilter[key].max >= parseFloat(truck[key]))) {
              continue;
            }
            else if(key === 'city' && addedFilter[key].includes(truck[key])) {
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
      this.filteredTrucks = Array.from(this.trucks);
    }
  }

  fetchNextTrucks()
  {
    if((this.filteredTrucks.length + 20) < this.trucks.length) {
      this.filteredTrucks = this.filteredTrucks.concat(this.trucks.slice(this.filteredTrucks.length, this.filteredTrucks.length + 20));
    }
    else {
      this.filteredTrucks = this.filteredTrucks.concat(this.trucks.slice(this.filteredTrucks.length));
    }
  }

  onIonInfinite(ev)
  {
    if(this.level === '2')
    {
      this.fetchNextTrucks();

      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
        if(this.filteredTrucks.length === this.trucks.length) {
          ev.target.disabled = true;
        }
      }, 500);
    }
    else
    {
      //this.auth.showPlanUpgrade();

      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
        if(this.filteredTrucks.length <= 20) {
          ev.target.disabled = true;
        }
      }, 500);
    }
  }

  viewTruck(truckId: string)
  {
    const navExtras: NavigationExtras = {
      state: {truckId}
    };

    this.router.navigate(['tabs/home/truckList/truck-sale-details'], navExtras);
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

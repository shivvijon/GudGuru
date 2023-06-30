import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { AuthService } from '../services/api/auth.service';
import { FuelService } from '../services/api/fuel.service';
import * as moment from 'moment';

@Component({
  selector: 'app-ifta',
  templateUrl: './ifta.page.html',
  styleUrls: ['./ifta.page.scss'],
})
export class IftaPage implements OnInit {

  fuelRefills: any[] = [];
  filteredFuelRefills: any[] = [];
  truckNumbers: any[] = [];
  isLoading: any;
  openFilter = false;
  clearFilter = false;
  filterResp = false;
  totalMiles = 0;
  totalGallons = 0;
  env = environment;

  constructor(
    private router: Router,
    public emergency: EmergencyLoadService,
    public api: FuelService,
    private auth: AuthService
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getFuelRefills();
  }

  getFuelRefills()
  {
    this.isLoading = true;
    this.api.getFuelRefills().subscribe((response: any) => {
      this.isLoading = false;
      console.log(response);
      this.fuelRefills = response.data;
      this.filteredFuelRefills = response.data;
      this.truckNumbers = response.truckNumbers;
    });
  }

  getFormattedTripDate(tripDate: string) {
    return moment(tripDate, 'DD/MM/YYYY').format('MMMM DD, YYYY');
  }

  async openFilterModal()
  {
    this.openFilter = true;
    this.clearFilter = true;
  }

  viewPoints(fuel: any)
  {
    const navExtras: NavigationExtras = {
      state: {fuel}
    };

    this.router.navigate(['tabs/home/ifta/single-ifta'], navExtras);
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

  async getFilteredFuels(filterData)
  {
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

    // Map quarter into months list
    if(addedFilter.quarter && addedFilter.quarter === 'Q1') {
      addedFilter.quarter = [0,1,2];
    }
    else if(addedFilter.quarter && addedFilter.quarter === 'Q2') {
      addedFilter.quarter = [3,4,5];
    }
    else if(addedFilter.quarter && addedFilter.quarter === 'Q3') {
      addedFilter.quarter = [6,7,8];
    }
    else if(addedFilter.quarter && addedFilter.quarter === 'Q4') {
      addedFilter.quarter = [9,10,11];
    }

    // Check if state is All or Empty
    if(addedFilter.state?.includes('All') || !addedFilter.state?.length) {
      delete addedFilter.state;
    }

    // Check if truck number is All or Empty
    if(addedFilter.truck?.includes('All') || !addedFilter.truck?.length) {
      delete addedFilter.truck;
    }

    console.log(addedFilter);

    if(filter)
    {
      if(!addedFilter.state && !addedFilter.truck)
      {
        this.filteredFuelRefills = this.fuelRefills.filter((fuel) => {
          const createdAt = moment(fuel.startDate, 'DD/MM/YYYY');
          const month = createdAt.month();
          const year = createdAt.year();
          // Compare all Keys based on AND condition
          for(const key in addedFilter)
          {
            if(key === 'quarter' && addedFilter[key].includes(month)) {
              continue;
            }
            else if(key === 'year' && parseFloat(addedFilter[key]) === year)  {
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
        this.filteredFuelRefills = this.fuelRefills.filter((fuel) => {
          const createdAt = moment(fuel.startDate, 'DD/MM/YYYY');
          const month = createdAt.month();
          const year = createdAt.year();
          // Compare all Keys based on AND condition
          for(const key in addedFilter)
          {
            if(key === 'quarter' && addedFilter[key].includes(month)) {
              continue;
            }
            else if(key === 'year' && parseFloat(addedFilter[key]) === year)  {
              continue;
            }
            else if(key === 'state' && (addedFilter[key].includes(fuel.origin) || addedFilter[key].includes(fuel.destination))) {
              continue;
            }
            else if(key === 'truck' && fuel.trucks.some((t: string) => addedFilter[key].includes(t))) {
              continue;
            }
            else {
              return false;
            }
          }

          return true;
        });
      }

      this.totalMiles = this.totalGallons = 0;
      this.filteredFuelRefills.forEach(fuel => {
        this.totalMiles += fuel.totalMiles;
        this.totalGallons += fuel.totalGallons;
      });

      this.filterResp = true;
    }
    else
    {
      this.filteredFuelRefills = Array.from(this.fuelRefills);
      this.filterResp = false;
    }

    console.log(this.filteredFuelRefills);
  }

}

import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { AuthService } from '../services/api/auth.service';
import { FuelService } from '../services/api/fuel.service';
import * as moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastService } from '../services/api/toast.service';
import { PaymentService } from '../services/api/payment.service';

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
  isReport = false;
  level: any;
  env = environment;

  constructor(
    private router: Router,
    public emergency: EmergencyLoadService,
    public api: FuelService,
    public auth: AuthService,
    private paymentService: PaymentService,
    private toast: ToastService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getLevel();
    this.getFuelRefills();
  }

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

  async openFilterModal(isReport = false)
  {
    this.isReport = isReport;

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
      // this.auth.showPlanUpgrade();
      this.router.navigate(['tabs/listing/notification']);
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
    const reportFilter = filterData;

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

      this.totalMiles = parseFloat(this.totalMiles.toFixed(2));
      this.totalGallons = parseFloat(this.totalGallons.toFixed(2));
      this.filterResp = true;
    }
    else
    {
      this.filteredFuelRefills = Array.from(this.fuelRefills);
      this.filterResp = false;
    }

    // Show Report Type list
    if(this.isReport && filterData)
    {
      this.filterResp = false;

      let reducedFuels: any[] = [];
      this.filteredFuelRefills.forEach(fuel => {
        reducedFuels = reducedFuels.concat(fuel.fuelPoints);
      });

      const fuelsReport: any[] = [];
      reducedFuels.forEach(fuel => {
        const index = fuelsReport.findIndex(r => (r.stopState === fuel.stopState));
        if(index === -1) {
          fuelsReport.push(JSON.parse(JSON.stringify(fuel)));
        }
        else
        {
          fuelsReport[index].miles += fuel.miles;
          fuelsReport[index].gallons += fuel.gallons;
          fuelsReport[index].miles = parseFloat(fuelsReport[index].miles.toFixed(2));
          fuelsReport[index].gallons = parseFloat(fuelsReport[index].gallons.toFixed(2));
        }
      });

      /* console.log('Reduced Fuels--->', fuelsReport); */

      const navExtras: NavigationExtras = {
        state: {
          reportFilter,
          filteredFuelRefills: fuelsReport,
          totalMiles: this.totalMiles,
          totalGallons: this.totalGallons}
      };

      (await this.modalCtrl.getTop()).onDidDismiss().then(() => {
        this.router.navigate(['tabs/home/ifta/report'], navExtras);
        this.isReport = false;
      });
    }

    console.log(this.filteredFuelRefills);
  }

  async presentAlert(id: string)
  {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to delete this fuel?',
      cssClass: 'delete-alert',
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Delete',
          cssClass: 'btn-delete',
          handler: () => this.deleteFuel(id)
        },
        {
          text: 'Cancel',
          cssClass: 'btn-cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  deleteFuel(id: string)
  {
    this.isLoading = true;
    this.api.deleteFuel(id).subscribe(resp => {
      console.log(resp);
      if(resp.success)
      {
        this.getFuelRefills();
        this.toast.presentToast(resp.message, 'success');
      }
    },
    (err) => {
      console.log(err);
      this.isLoading = false;
      if(err.status !== 502) {
        this.toast.presentToast(err.error.message, 'danger');
      }
    });
  }

}

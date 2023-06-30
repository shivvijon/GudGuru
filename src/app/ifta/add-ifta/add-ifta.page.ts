import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmergencyLoadService } from '../../services/api/emergency-load.service';
import { AuthService } from '../../services/api/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { StateComponent } from '../../modals/state/state.component';
import { CityComponent } from '../../modals/city/city.component';
import * as moment from 'moment';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from '../../services/api/toast.service';
import { PaymentService } from '../../services/api/payment.service';
import { FuelService } from 'src/app/services/api/fuel.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Location } from '@angular/common';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-add-ifta',
  templateUrl: './add-ifta.page.html',
  styleUrls: ['./add-ifta.page.scss'],
})
export class AddIftaPage implements OnInit {

  fuelForm: FormGroup;
  openDatetime = false;
  openStartDatetime = false;
  selectedDatetime: string;
  selectedStartDate: string;
  loading = false;
  level: any;
  alertMessage: any;
  selectedPhotos: any[] = [];
  minDate: any;
  maxDate: any;
  addCurrentTrip: any;
  fuelPoint: any;
  headTitle = 'Create Trip';
  mode: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private modalController: ModalController,
    public emergency: EmergencyLoadService,
    public api: FuelService,
    private auth: AuthService,
    private toast: ToastService,
    private paymentService: PaymentService,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController
  )
  {
    this.fuelForm = new FormGroup({
      origin: new FormControl(null, [Validators.required]),
      destination: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      truckNumber: new FormControl(null, [Validators.required]),
      refillDate: new FormControl(null, [Validators.required]),
      stopState: new FormControl(null, [Validators.required]),
      miles: new FormControl(null, [Validators.required]),
      gallons: new FormControl(null, [Validators.required])
    });

    this.minDate = new Date('1990-01-01').toISOString();
    const maxDt = moment();
    this.maxDate = new Date(maxDt.year(), maxDt.month(), maxDt.date(), 23, 59).toISOString();

    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state) {
        this.mode = router.getCurrentNavigation().extras.state.mode;
        this.addCurrentTrip = router.getCurrentNavigation().extras.state.fuel;
        this.fuelPoint = router.getCurrentNavigation().extras.state.fuelPoint;
        this.headTitle = 'Trip Details';
        this.patchForm();
      }
    });
  }

  ngOnInit() {
    this.getLevel();
  }

  patchForm()
  {
    this.fuelForm.patchValue({
      origin: this.addCurrentTrip.origin,
      destination: this.addCurrentTrip.destination,
      startDate: moment(this.addCurrentTrip.startDate, 'DD/MM/YYYY').format('MM/DD/YYYY')
    });

    if(this.mode === 'add') {
      this.fuelForm.patchValue({
        truckNumber: this.addCurrentTrip.fuelPoints[0].truckNumber
      });
    }
    else if(this.mode === 'update') {
      this.fuelForm.patchValue({
        truckNumber: this.fuelPoint.truckNumber,
        refillDate: moment(this.fuelPoint.refillDate, 'DD/MM/YYYY').format('MM/DD/YYYY'),
        stopState: this.fuelPoint.stopState,
        miles: this.fuelPoint.miles,
        gallons: this.fuelPoint.gallons
      });
    }
  }

  async openStateModal(state: string)
  {
    const selectedState = this.fuelForm.get(state).value;

    const modal = await this.modalController.create({
      component: StateComponent,
      componentProps: {selectedState},
      backdropDismiss: false,
      cssClass: 'state-list'
    });

    await modal.present();

    modal.onDidDismiss().then(resp => {
      if(resp.data?.selectedState)
      {
        this.fuelForm.patchValue({[state]: resp.data.selectedState});
        if(this.fuelForm.get('origin').value && this.fuelForm.get('stopState').value) {
          this.showLoading();
          this.getStateDistance(this.fuelForm.get('origin').value, this.fuelForm.get('stopState').value);
        }
      }
    });
  }

  getStateDistance(origin: string, destination: string)
  {
    this.api.getStateDistance(origin, destination, this.addCurrentTrip).subscribe(resp => {
      const googleResp = resp.data;
      this.loadingCtrl.dismiss();
      if(googleResp.status === 'OK' && googleResp.rows[0].elements[0].status === 'OK')
      {
        let distance = googleResp.rows[0].elements[0].distance.text.split(' ')[0].replace(',', '');
        distance = (parseFloat(distance) * 0.621371).toFixed(2);
        this.fuelForm.patchValue({miles: distance});
      }
    });
  }

  /* async openCityModal()
  {
    const selectedState = this.fuelForm.get('state').value;
    const selectedCity = this.fuelForm.get('city').value;

    const modal = await this.modalController.create({
      component: CityComponent,
      componentProps: {selectedState, selectedCity},
      backdropDismiss: false,
      cssClass: 'city-list'
    });

    await modal.present();

    modal.onDidDismiss().then(resp => {
      if(resp.data?.selectedCity)
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.fuelForm.patchValue({city: resp.data.selectedCity});
      }
    });
  } */

  setDatetime(event, mode: string)
  {
    if(mode === 'tripDate') {
      this.selectedStartDate = event.target.value;
    }
    else if(mode === 'fuelDate') {
      this.selectedDatetime = event.target.value;
    }
    console.log(this.selectedDatetime);
  }

  patchDatetime(mode: string)
  {
    if(mode === 'tripDate')
    {
      const selDate = moment(this.selectedStartDate).format('MM/DD/YYYY');
      this.fuelForm.patchValue({startDate: selDate});
      this.openStartDatetime = false;
    }
    else if(mode === 'fuelDate')
    {
      const selDate = moment(this.selectedDatetime).format('MM/DD/YYYY');
      this.fuelForm.patchValue({refillDate: selDate});
      this.openDatetime = false;
    }
  }

  async addPhotos()
  {
    const result = await FilePicker.pickImages({
      multiple: true,
      readData: true
    });

    result.files.forEach(async file => {
      const buffer = Buffer.from(file.data, 'base64');
      const blob = new Blob([buffer], {type: file.mimeType});

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        this.selectedPhotos.push({src: reader.result, blob, fileType: 'img', fileName: file.name});
      };
    });

    console.log(result);
  }

  async addDocuments()
  {
    const result = await FilePicker.pickFiles({
      types: ['application/pdf', 'application/doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      multiple: true,
      readData: true
    });

    result.files.forEach(async file => {
      const buffer = Buffer.from(file.data, 'base64');
      const blob = new Blob([buffer], {type: file.mimeType});
      this.selectedPhotos.push({blob, fileType: 'doc', fileName: file.name});
    });

    console.log(result);
  }

  removePhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
  }

  async presentSheet()
  {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Upload Invoice',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [
        {
          text: 'Choose from Gallery',
          handler: () => this.addPhotos()
        },
        {
          text: 'Choose from Files',
          handler: () => this.addDocuments()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        },
      ],
    });

    await actionSheet.present();
  }

  async showLoading()
  {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
    });

    await loading.present();
  }

  addFuel(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    if(this.level === '2' && this.auth.subscriptionStatus === 'active')
    {
      this.loading = true;

      const postForm = new FormData();
      if(this.addCurrentTrip && this.mode === 'add') {
        // eslint-disable-next-line no-underscore-dangle
        postForm.append('_id', this.addCurrentTrip._id);
      }
      else if(this.addCurrentTrip && this.mode === 'update') {
        // eslint-disable-next-line no-underscore-dangle
        postForm.append('fuelPoints[_id]', this.fuelPoint._id);
      }
      postForm.append('origin', this.fuelForm.value.origin);
      postForm.append('destination', this.fuelForm.value.destination);
      postForm.append('startDate', moment(this.fuelForm.value.startDate, 'MM/DD/YYYY').format('DD/MM/YYYY'));
      postForm.append('fuelPoints[truckNumber]', this.fuelForm.value.truckNumber);
      postForm.append('fuelPoints[refillDate]', moment(this.fuelForm.value.refillDate, 'MM/DD/YYYY').format('DD/MM/YYYY'));
      postForm.append('fuelPoints[stopState]', this.fuelForm.value.stopState);
      postForm.append('fuelPoints[miles]', this.fuelForm.value.miles);
      postForm.append('fuelPoints[gallons]', this.fuelForm.value.gallons);
      this.selectedPhotos.forEach(photo => {
        postForm.append('file[]', photo.blob, photo.fileName);
      });

      if(this.addCurrentTrip && this.mode === 'update') {
        // eslint-disable-next-line no-underscore-dangle
        this.api.updateFuel(this.addCurrentTrip._id, postForm).subscribe(resp => {
          console.log(resp);
          this.loading = false;
          if(resp.success)
          {
            this.toast.presentToast('Fuel updated', 'success');
            this.location.back();
          }
        },
        (err) => {
          this.loading = false;
          console.error(err);
          if(err.status !== 502 && err.error) {
            this.toast.presentToast('Unable to update fuel', 'danger');
          }
        });
      }
      else {
        this.api.addfuel(postForm).subscribe(resp => {
          console.log(resp);
          this.loading = false;
          if(resp.success)
          {
            this.toast.presentToast('Fuel Added', 'success');
            this.location.back();
          }
        },
        (err) => {
          this.loading = false;
          console.error(err);
          if(err.status !== 502 && err.error) {
            this.toast.presentToast('Unable to add fuel', 'danger');
          }
        });
      }
    }
    else {
      this.auth.showPlanUpgrade();
    }
  }

  navToNotifications()
  {
    if(!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) {
      this.auth.showPlanUpgrade();
    }
    else {
      this.router.navigate(['tabs/home/notification']);
    }
  }

  getLevel()
  {
    this.loading = true;
    this.paymentService.getLevel().subscribe(resp => {
      console.log(resp);
      this.level=resp.level;
      this.getTrialStatus();
    },
    (err) => {
      this.loading = false;
      console.error(err);
    });
  }

  getTrialStatus()
  {
    this.auth.getTrialStatus().subscribe((resp) => {
      this.loading = false;
      if(resp.success)
      {
        this.auth.isTrial = resp.isTrial;
        this.auth.subscriptionStatus = resp.subscriptionStatus;
        this.auth.daysLeft = resp.daysLeft;
      }
    });
  }

}

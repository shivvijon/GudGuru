import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { TruckService } from '../services/api/truck.service';
import { ToastService } from '../services/api/toast.service';
import { StateComponent } from '../modals/state/state.component';
import { CityComponent } from '../modals/city/city.component';
import * as moment from 'moment';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Keyboard } from '@capacitor/keyboard';
import { AuthService } from '../services/api/auth.service';
import { PaymentService } from '../services/api/payment.service';
import { Buffer } from 'buffer';
import { Location } from '@angular/common';

@Component({
  selector: 'app-truck-part',
  templateUrl: './truck-part.page.html',
  styleUrls: ['./truck-part.page.scss'],
})
export class TruckPartPage implements OnInit {

  truckPartForm: FormGroup;
  openDatetime = false;
  selectedDatetime: string;
  loading = false;
  level: any;
  alertMessage: any;
  isEmLoading: boolean;
  selectedPhotos: any[] = [];
  partId: string;
  truckData: any;
  headTitle = 'Truck Part Sale';

  constructor(
    private router: Router,
    private modalController: ModalController,
    public emergency: EmergencyLoadService,
    public api: TruckService,
    private auth: AuthService,
    private toast: ToastService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private location: Location
  )
  {
    this.truckPartForm = new FormGroup({
      make: new FormControl(null, [Validators.required]),
      part: new FormControl(null, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      year: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      city: new FormControl({value: null, disabled: true}, [Validators.required]),
      contactno: new FormControl(null, [Validators.required]),
      comment: new FormControl(null, [Validators.required])
    });

    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state) {
        this.partId = router.getCurrentNavigation().extras.state.partId;
        this.truckData = router.getCurrentNavigation().extras.state.truckData;
        this.headTitle = 'Edit Truck Part Sale';
        this.patchForm();
      }
    });
  }

  ngOnInit() {}

  ionViewWillEnter(){
    this.getLevel();
  }

  patchForm()
  {
    this.truckPartForm.get('city').enable({onlySelf: true});
    this.truckPartForm.patchValue({
      make: this.truckData.make,
      part: this.truckData.part,
      price: this.truckData.price,
      year: this.truckData.year,
      state: this.truckData.state,
      city: this.truckData.city,
      contactno: this.truckData.contactno,
      comment: this.truckData.comment
    });
    this.selectedDatetime = this.truckData.year;
  }

  async openStateModal()
  {
    const selectedState = this.truckPartForm.get('state').value;

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
        this.truckPartForm.patchValue({state: resp.data.selectedState});
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          selectedState !== resp.data?.selectedState ? this.truckPartForm.patchValue({city: null}) : null;
          this.truckPartForm.get('city').enable({onlySelf: true});
      }
    });
  }

  async openCityModal()
  {
    const selectedState = this.truckPartForm.get('state').value;
    const selectedCity = this.truckPartForm.get('city').value;

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
        this.truckPartForm.patchValue({city: resp.data.selectedCity});
      }
    });
  }

  setDatetime(event) {
    this.selectedDatetime = event.target.value;
    console.log(this.selectedDatetime);
  }

  patchDatetime()
  {
    const selDate = moment(this.selectedDatetime).format('YYYY');
    this.truckPartForm.patchValue({year: selDate});
    this.openDatetime = false;
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

  removePhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
  }

  addTruck(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    if(this.level === '2' && this.auth.subscriptionStatus === 'active')
    {
      this.loading = true;

      console.log(this.truckPartForm.value);

      const postForm = new FormData();
      postForm.append('make', this.truckPartForm.value.make);
      postForm.append('part', this.truckPartForm.value.part);
      postForm.append('price', this.truckPartForm.value.price);
      postForm.append('year', this.truckPartForm.value.year);
      postForm.append('state', this.truckPartForm.value.state);
      postForm.append('city', this.truckPartForm.value.city);
      postForm.append('contactno', this.truckPartForm.value.contactno);
      postForm.append('comment', this.truckPartForm.value.comment);
      this.selectedPhotos.forEach(photo => {
        postForm.append('file[]', photo.blob, photo.fileName);
      });

      if(this.partId)
      {
        this.api.updateTruckPart(this.partId, postForm).subscribe(resp => {
          console.log(resp);
          this.loading = false;
          if(resp.success)
          {
            this.toast.presentToast('Truck Part updated', 'success');
            this.location.back();
          }
        },
        (err) => {
          this.loading = false;
          console.error(err);
          if(err.status !== 502 && err.error) {
            this.toast.presentToast('Unable to update truck part', 'danger');
          }
        });
      }
      else
      {
        this.api.addTruckPart(postForm).subscribe(resp => {
          console.log(resp);
          this.loading = false;
          if(resp.success)
          {
            this.toast.presentToast('Truck Part Added', 'success');
            this.router.navigate(['/tabs/listing']);
          }
        },
        (err) => {
          this.loading = false;
          console.error(err);
          if(err.status !== 502 && err.error) {
            this.toast.presentToast('Unable to add truck part', 'danger');
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

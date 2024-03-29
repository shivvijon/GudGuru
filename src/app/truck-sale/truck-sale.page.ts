import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { AuthService } from '../services/api/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { StateComponent } from '../modals/state/state.component';
import { CityComponent } from '../modals/city/city.component';
import * as moment from 'moment';
import { Keyboard } from '@capacitor/keyboard';
import { TruckService } from '../services/api/truck.service';
import { ToastService } from '../services/api/toast.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { PaymentService } from '../services/api/payment.service';
import { Buffer } from 'buffer';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-truck-sale',
  templateUrl: './truck-sale.page.html',
  styleUrls: ['./truck-sale.page.scss'],
})
export class TruckSalePage implements OnInit {

  truckForm: FormGroup;
  openDatetime = false;
  selectedDatetime: string;
  loading = false;
  level: any;
  alertMessage: any;
  selectedPhotos: any[] = [];
  truckId: string;
  truckData: any;
  headTitle = 'Truck Sale';
  socketSubs: Subscription;

  constructor(
    private router: Router,
    private modalController: ModalController,
    public emergency: EmergencyLoadService,
    public api: TruckService,
    private auth: AuthService,
    private toast: ToastService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private location: Location,
    private socket: SocketService
  )
  {
    this.truckForm = new FormGroup({
      miles: new FormControl(null, [Validators.required]),
      make: new FormControl(null, [Validators.required]),
      model: new FormControl(null, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      year: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      city: new FormControl({value: null, disabled: true}, [Validators.required]),
      contactno: new FormControl(null, [Validators.required]),
      comment: new FormControl(null, [Validators.required])
    });

    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state) {
        this.truckId = router.getCurrentNavigation().extras.state.truckId;
        this.truckData = router.getCurrentNavigation().extras.state.truckData;
        this.headTitle = 'Edit Truck Sale';
        this.patchForm();
      }
    });
  }

  ngOnInit() {}

  ionViewWillEnter(){
    this.getLevel();
    this.listenSocket();
  }

  patchForm()
  {
    this.truckForm.get('city').enable({onlySelf: true});
    this.truckForm.patchValue({
      miles: this.truckData.miles,
      make: this.truckData.make,
      model: this.truckData.model,
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
    const selectedState = this.truckForm.get('state').value;

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
        this.truckForm.patchValue({state: resp.data.selectedState});
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          selectedState !== resp.data?.selectedState ? this.truckForm.patchValue({city: null}) : null;
          this.truckForm.get('city').enable({onlySelf: true});
      }
    });
  }

  async openCityModal()
  {
    const selectedState = this.truckForm.get('state').value;
    const selectedCity = this.truckForm.get('city').value;

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
        this.truckForm.patchValue({city: resp.data.selectedCity});
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
    this.truckForm.patchValue({year: selDate});
    this.openDatetime = false;
  }

  async addPhotos()
  {
    const result = await FilePicker.pickImages({
      multiple: true,
      readData: true,
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

    this.loading = true;

    const postForm = new FormData();
    postForm.append('miles', this.truckForm.value.miles);
    postForm.append('make', this.truckForm.value.make);
    postForm.append('model', this.truckForm.value.model);
    postForm.append('price', this.truckForm.value.price);
    postForm.append('year', this.truckForm.value.year);
    postForm.append('state', this.truckForm.value.state);
    postForm.append('city', this.truckForm.value.city);
    postForm.append('contactno', this.truckForm.value.contactno);
    postForm.append('comment', this.truckForm.value.comment);
    this.selectedPhotos.forEach(photo => {
      postForm.append('file[]', photo.blob, photo.fileName);
    });

    if(this.truckId)
    {
      this.api.updateTruck(this.truckId, postForm).subscribe(resp => {
        console.log(resp);
        this.loading = false;
        if(resp.success)
        {
          this.toast.presentToast('Truck updated', 'success');
          this.location.back();
        }
      },
      (err) => {
        this.loading = false;
        console.error(err);
        if(err.status !== 502 && err.error) {
          this.toast.presentToast('Unable to update truck', 'danger');
        }
      });
    }
    else
    {
      this.api.addTruck(postForm).subscribe(resp => {
        console.log(resp);
        this.loading = false;
        if(resp.success)
        {
          this.toast.presentToast('Truck Added', 'success');
          this.router.navigate(['/tabs/listing']);
        }
      },
      (err) => {
        this.loading = false;
        console.error(err);
        if(err.status !== 502 && err.error) {
          this.toast.presentToast('Unable to add truck', 'danger');
        }
      });
    }

    /* if(this.level === '2' && (this.auth.subscriptionStatus === 'active' || this.auth.subscriptionStatus === 'trialing'))
    {}
    else {
      this.auth.showPlanUpgrade();
    } */
  }

  navToNotifications()
  {
    if(!this.auth.isTrial && this.auth.user?.role === '0' &&
    (this.auth.subscriptionStatus === 'inactive' || this.auth.subscriptionStatus === 'past_due')) {
      // this.auth.showPlanUpgrade();
      this.router.navigate(['tabs/home/notification']);
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

  listenSocket()
  {
    this.socketSubs = this.socket.on('onStripePayment').subscribe(resp => {
      this.getLevel();
    });
  }

  ionViewWillLeave() {
    this.socketSubs.unsubscribe();
  }

}

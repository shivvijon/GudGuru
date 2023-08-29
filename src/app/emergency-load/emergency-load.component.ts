import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import { LoadService } from '../services/api/load.service';
import { ToastService } from '../services/api/toast.service';
import { Keyboard } from '@capacitor/keyboard';
import { ModalController } from '@ionic/angular';
import { StateComponent } from '../modals/state/state.component';
import { CityComponent } from '../modals/city/city.component';
import * as moment from 'moment';

@Component({
  selector: 'app-emergency-load',
  templateUrl: './emergency-load.component.html',
  styleUrls: ['./emergency-load.component.scss'],
})
export class EmergencyLoadComponent implements OnInit {

  modalInitialBr = 1;
  currentLocation: string;
  autoCloseTimer: any;

  openLoadForm = false;
  loadForm: FormGroup;
  openDatetime = false;
  selectedDatetime: string;
  loading = false;

  constructor(
    public emergency: EmergencyLoadService,
    private modalController: ModalController,
    private api: LoadService,
    private toast: ToastService
  )
  {
    this.loadForm = new FormGroup({
      emergency: new FormControl({value: true, disabled: true}),
      weight: new FormControl(null, [Validators.required]),
      weightType: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      fromState: new FormControl(null, [Validators.required]),
      fromCity: new FormControl(null, [Validators.required]),
      pickDate: new FormControl(null, [Validators.required]),
      fromAddress: new FormControl(null, [Validators.required]),
      toState: new FormControl(null, [Validators.required]),
      toCity: new FormControl({value: null, disabled: true}, [Validators.required]),
      toAddress: new FormControl(null),
      contact: new FormControl(null, [Validators.required]),
      title: new FormControl(null, [Validators.required]),
      notificationDistance: new FormControl(null),
      mcNo: new FormControl(null, [Validators.required]),
      referenceId: new FormControl(null),
      remarks: new FormControl(null),
      price: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {}

  async openStateModal(loc: string)
  {
    const selectedState = (loc === 'from') ? this.loadForm.get('fromState').value : this.loadForm.get('toState').value;

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
        if(loc === 'from')
        {
          this.loadForm.patchValue({fromState: resp.data.selectedState});
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          selectedState !== resp.data?.selectedState ? this.loadForm.patchValue({fromCity: null}) : null;
          this.loadForm.get('fromCity').enable({onlySelf: true});
        }
        else
        {
          this.loadForm.patchValue({toState: resp.data.selectedState});
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          selectedState !== resp.data?.selectedState ? this.loadForm.patchValue({toCity: null}) : null;
          this.loadForm.get('toCity').enable({onlySelf: true});
        }
      }
    });
  }

  async openCityModal(loc: string)
  {
    const selectedState = (loc === 'from') ? this.loadForm.get('fromState').value : this.loadForm.get('toState').value;
    const selectedCity = (loc === 'from') ? this.loadForm.get('fromCity').value : this.loadForm.get('toCity').value;

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
        (loc === 'from') ? this.loadForm.patchValue({fromCity: resp.data.selectedCity}) :
                          this.loadForm.patchValue({toCity: resp.data.selectedCity});
      }
    });
  }

  setDatetime(event) {
    this.selectedDatetime = event.target.value;
    console.log(this.selectedDatetime);
  }

  patchDatetime()
  {
    const selDate = moment(this.selectedDatetime).format('Do MMM, YYYY');
    this.loadForm.patchValue({pickDate: selDate});
    this.openDatetime = false;
  }

  addLoad(isEnterKeyHit: boolean = false)
  {
    if(isEnterKeyHit) {
      Keyboard.hide();
    }

    this.loading = true;

    const loadPost = this.loadForm.value;

    loadPost.emergency = true;
    loadPost.weight_type = loadPost.weightType;
    loadPost.contactno = loadPost.contact;
    loadPost.location = {
      lat: this.emergency.location.lat,
      long: this.emergency.location.long
    };

    loadPost.from = {
      state: loadPost.fromState,
      city: loadPost.fromCity,
      address: loadPost.fromAddress,
      pickupdate: loadPost.pickDate
    };

    loadPost.to = {
      state: loadPost.toState,
      city: loadPost.toCity,
      address: loadPost.toAddress
    };

    ['fromState', 'fromCity','toState', 'toCity', 'fromAddress',
    'toAddress', 'pickDate', 'contact', 'weightType'].forEach(key => delete loadPost[key]);

    this.api.addLoad(loadPost).subscribe(resp => {
      console.log(resp);
      this.loading = false;
      if(resp.success)
      {
        this.openLoadForm = false;
        this.emergency.isLoadRequestSent = true;
        this.clearLoadForm();
      }
    },
    (err) => {
      this.loading = false;
      console.error(err);
      if(err.status !== 502 && err.error) {
        this.toast.presentToast('Unable to add load', 'danger');
      }
    });
  }

  closeModal(isDataSelected)
  {
    if(isDataSelected)
    {
      this.openLoadForm = true;
      this.patchLoadFormValues();
    }
    else {
      this.emergency.openEmergencyModal = false;
    }
  }

  patchLoadFormValues()
  {
    this.loadForm.patchValue({
      fromState: this.emergency.currentState,
      fromCity: this.emergency.currentCity,
      pickDate: moment().format('Do MMM, YYYY - h:mm a'),
      fromAddress: this.emergency.currentLocation,
      notificationDistance: this.emergency.notificationDistance
    });
  }

  clearLoadForm()
  {
    this.autoCloseTimer = setTimeout(() => {
      this.emergency.openEmergencyModal = false;
      this.emergency.isLoadRequestSent = false;
    }, 5000);

    this.loadForm.patchValue({
      weight: null,
      weightType: null,
      type: null,
      fromState: null,
      fromCity: null,
      pickDate: null,
      fromAddress: null,
      toState: null,
      toCity: null,
      toAddress: null,
      contact: null,
      title: null,
      notificationDistance: null
    });
  }

  closeTimeout()
  {
    this.emergency.openEmergencyModal = false;
    clearTimeout(this.autoCloseTimer);
    this.emergency.isLoadRequestSent = false;
  }

}

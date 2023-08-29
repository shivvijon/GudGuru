import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonDatetime, ModalController, Platform } from '@ionic/angular';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { CityComponent } from '../modals/city/city.component';
import { StateComponent } from '../modals/state/state.component';
import * as moment from 'moment';
import { LoadService } from '../services/api/load.service';
import { ToastService } from '../services/api/toast.service';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { EmergencyLoadService } from '../services/api/emergency-load.service';
import {  PaymentService } from '../services/api/payment.service';
import { AuthService } from '../services/api/auth.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';

@disableSideMenu()
@Component({
  selector: 'app-loads',
  templateUrl: './loads.page.html',
  styleUrls: ['./loads.page.scss'],
})
export class LoadsPage implements OnInit {

  @ViewChild('ionDatetime') ionDatetimeElm: IonDatetime;

  loadForm: FormGroup;
  openDatetime = false;
  selectedDatetime: string;
  loading = false;
  level: any;
  alertMessage: any;
  minDate: string;
  maxDate: string;
  isEmLoading: boolean;
  socketSubs: Subscription;


  constructor(
    private modalController: ModalController,
    private api: LoadService,
    private toast: ToastService,
    private router: Router,
    public emergency: EmergencyLoadService,
    public paymentService: PaymentService,
    private platform: Platform,
    private userService: AuthService,
    private socket: SocketService
    )
  {
    this.loadForm = new FormGroup({
      emergency: new FormControl({value: false, disabled: true}),
      weight: new FormControl(null, [Validators.required]),
      weightType: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      fromState: new FormControl(null, [Validators.required]),
      fromCity: new FormControl({value: null, disabled: true}, [Validators.required]),
      pickDate: new FormControl(null, [Validators.required]),
      fromAddress: new FormControl(null),
      toState: new FormControl(null, [Validators.required]),
      toCity: new FormControl({value: null, disabled: true}, [Validators.required]),
      toAddress: new FormControl(null),
      contact: new FormControl(null),
      email: new FormControl(null, [Validators.email]),
      title: new FormControl(null, [Validators.required]),
      mcNo: new FormControl(null, [Validators.required]),
      referenceId: new FormControl(null),
      remarks: new FormControl(null),
      price: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
    this.minDate = this.selectedDatetime = new Date().toISOString();

    const maxDt = moment().add(7, 'days');
    this.maxDate = new Date(maxDt.year(), maxDt.month(), maxDt.date(), 23, 59).toISOString();
  }

  ionViewWillEnter(){
    this.getLevel();
    this.listenSocket();
  }

  disableMonthPicker()
  {
    const ionDateTimeElement = document.getElementsByTagName('ion-datetime');
    let element: HTMLElement;
    if(this.platform.is('ios')) {
      element = ionDateTimeElement[0].shadowRoot.getRootNode().childNodes[1] as HTMLElement;
    }
    else {
      element = ionDateTimeElement[0].shadowRoot.getRootNode().childNodes[0] as HTMLElement;
    }

    const monthPicker = element.getElementsByClassName('calendar-month-year')[0] as HTMLElement;
    if(monthPicker) {
      monthPicker.style.pointerEvents = 'none';
    }
  }

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

    if(this.level === '2' && this.userService.subscriptionStatus === 'active')
    {
      this.loading = true;

      const loadPost = this.loadForm.value;

      loadPost.weight_type = loadPost.weightType;
      loadPost.contactno = loadPost.contact;
      loadPost.location = {
        lat: '',
        long: ''
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
          this.toast.presentToast((loadPost.emergency ? 'Emergency ' : '') + 'Load Added', 'success');
          this.router.navigate(['/tabs/listing']);
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
    else {
      this.userService.showPlanUpgrade();
    }
  }

  getLevel()
  {
    this.isEmLoading = true;
    this.paymentService.getLevel().subscribe(resp => {
      console.log(resp);
      this.level=resp.level;
      this.getTrialStatus();
    },
    (err) => {
      this.isEmLoading = false;
      console.error(err);
    });
  }

  getTrialStatus()
  {
    this.userService.getTrialStatus().subscribe((resp) => {
      this.isEmLoading = false;
      if(resp.success)
      {
        this.userService.isTrial = resp.isTrial;
        this.userService.subscriptionStatus = resp.subscriptionStatus;
        this.userService.daysLeft = resp.daysLeft;
        if(this.level === '2' && this.userService.subscriptionStatus === 'active') {
          this.loadForm.get('emergency').enable({onlySelf: true});
          this.alertMessage='';
        }
        else{ this.alertMessage='Updgrade Your Plan';}
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

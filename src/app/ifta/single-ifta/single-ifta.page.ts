import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EmergencyLoadService } from '../../services/api/emergency-load.service';
import { AuthService } from '../../services/api/auth.service';
import { FuelService } from 'src/app/services/api/fuel.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { HttpEventType } from '@angular/common/http';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { ToastService } from 'src/app/services/api/toast.service';
import * as moment from 'moment';

@Component({
  selector: 'app-single-ifta',
  templateUrl: './single-ifta.page.html',
  styleUrls: ['./single-ifta.page.scss'],
})
export class SingleIftaPage implements OnInit {
  fuelId: string;
  fuelPoints: any;
  isLoading: any;
  openFilter = false;
  clearFilter = false;
  selectedPoint: any;
  showInvoices = false;
  env = environment;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public emergency: EmergencyLoadService,
    public api: FuelService,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private fileOpener: FileOpener,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private platform: Platform
  )
  {
    //this.showLoading();
    route.params.subscribe(param => {
      if(router.getCurrentNavigation().extras.state) {
        // eslint-disable-next-line no-underscore-dangle
        this.fuelId = router.getCurrentNavigation().extras.state.fuel?._id;
        //this.getFuel(this.fuelId);
      }
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    if(this.fuelId)
    {
      this.showLoading().then(() => {
        this.getFuel(this.fuelId);
      });
    }
  }

  getFuel(id: string)
  {
    this.fuelPoints = null;
    this.api.getFuelRefillById(id).subscribe(resp => {
      this.fuelPoints = resp.data[0];
      this.loadingCtrl.dismiss();
    });
  }

  async showLoading()
  {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
    });

    await loading.present();
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

  navToAddIfta(mode: string, fuelPoint: any = null)
  {
    const navExtras: NavigationExtras = {
      state: {mode, fuel: this.fuelPoints, fuelPoint}
    };

    this.router.navigate(['tabs/home/ifta/add-ifta'], navExtras);
  }

  getFuelInvoices(point: any)
  {
    this.isLoading = true;
    // eslint-disable-next-line no-underscore-dangle
    this.api.getFuelInvoices(this.fuelPoints._id, point._id).subscribe(resp => {
      if(resp.data.length) {
        this.setSelectedPoint(point, resp.data);
      }
      else
      {
        this.showInvoices=false;
        this.selectedPoint=null;
      }
    });
  }

  getFormattedTripDate(fuelDate: string) {
    return moment(fuelDate, 'DD/MM/YYYY').format('MMMM DD, YYYY');
  }

  setSelectedPoint(point: any, documents: string[])
  {
    const docs = [];

    documents.forEach(doc => {
      docs.push({name: doc, isLoading: false});
    });

    const tempPoint = JSON.parse(JSON.stringify(point));
    tempPoint.documents = docs;
    this.selectedPoint = tempPoint;
    this.isLoading = false;
  }

  blobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });

  viewInvoice(doc: any)
  {
    doc.isLoading = true;
    this.api.getInvoice(doc.name).subscribe(async event => {
      if(event.type === HttpEventType.Response)
      {
        console.log(event);
        const base64 = await this.blobToBase64(event.body) as string;

        const savedFile = await Filesystem.writeFile({
          path: doc.name,
          data: base64,
          directory: this.platform.is('ios') ? Directory.Documents : Directory.Library
        });

        doc.isLoading = false;

        this.fileOpener.open(savedFile.uri, event.body.type).then(() => {})
        .catch(err => console.error(err));
      }
    });
  }

  async presentAlert(doc: any)
  {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure you want to delete this Invoice?',
      cssClass: 'delete-alert',
      mode: 'md',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Delete',
          cssClass: 'btn-delete',
          handler: () => this.deleteInvoice(doc)
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

  async deleteInvoice(doc: any)
  {
    this.isLoading = true;
    // eslint-disable-next-line no-underscore-dangle
    this.api.deleteFuelInvoice(this.fuelPoints._id, this.selectedPoint._id, doc.name).subscribe(resp => {
      this.toast.presentToast(resp.msg, 'success');
      this.getFuelInvoices(JSON.parse(JSON.stringify(this.selectedPoint)));
    },
    (err) => {
      console.log(err);
      this.isLoading = false;
      if(err.status !== 502) {
        this.toast.presentToast('Invoice not found', 'danger');
      }
    });
  }

}

import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private alertController: AlertController) { }

  async presentAlert(title: string, msg: string)
  {
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      cssClass: 'error-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Ok',
        role: 'cancel'
      }]
    });

    await alert.present();
  }


  async comingSoon(msg: string)
  {
    const alert = await this.alertController.create({
      message: msg,
      cssClass: 'coming-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Ok',
        role: 'cancel'
      }]
    });

    await alert.present();
  }
}

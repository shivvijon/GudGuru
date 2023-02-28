import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async presentToast(msg: string, color: string)
  {
    const toast = await this.toastController.create({
      message: msg,
      color,
      duration: 5000
    });

    await toast.present();
  }
}

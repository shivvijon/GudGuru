import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { city } from 'src/app/location/citylist';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
})
export class CityComponent implements OnInit {

  cityList: any[] = city;
  cities: any[] = [];
  filteredCities: any[] = [];
  selectedState: string;
  selectedCity: string;


  constructor(
    private navParams: NavParams,
    private modalController: ModalController)
  {
    if(navParams.get('selectedState'))
    {
      this.selectedState = navParams.get('selectedState');
      this.cities = city.filter(c => c.state === this.selectedState);
      this.filteredCities = this.cities.filter((c, index, self) => index === self.findIndex((t) => t.city === c.city));
    }

    if(navParams.get('selectedCity')) {
      this.selectedCity = navParams.get('selectedCity');
    }
  }

  ngOnInit() {}

  setStateCity(event: any)
  {
    this.selectedCity = event.target.value;
  }

  getfilteredCities(event: any)
  {
    const searchedText: string = event.target.value;

    this.filteredCities = this.cities.filter((c: any) => c.city.toLowerCase().includes(searchedText.toLowerCase()));
  }

  resetCities() {
    this.filteredCities = Array.from(this.cities);
  }

  closeModal(close: boolean)
  {
    if(close) {
      this.selectedCity = null;
    };

    this.modalController.dismiss({selectedCity: this.selectedCity});
  }

}

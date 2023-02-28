import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { statename } from 'src/app/location/citylist';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss'],
})
export class StateComponent implements OnInit {

  states: string[] = statename;
  filteredStates: string[] = [];
  selectedState: string;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams)
  {
    this.filteredStates = Array.from(this.states);
    if(navParams.get('selectedState')) {
      this.selectedState = navParams.get('selectedState');
    }
  }

  ngOnInit() {}

  setStateCity(event: any)
  {
    this.selectedState = event.target.value;
  }

  getfilteredStates(event: any)
  {
    const searchedText: string = event.target.value;

    this.filteredStates = this.states.filter((s: string) => s.toLowerCase().includes(searchedText.toLowerCase()));
  }

  resetStates() {
    this.filteredStates = Array.from(this.states);
  }

  closeModal(close: boolean)
  {
    if(close) {
      this.selectedState = null;
    };

    this.modalController.dismiss({selectedState: this.selectedState});
  }

}

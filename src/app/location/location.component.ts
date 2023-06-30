import { Component, Input, OnInit, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventEmitter } from '@angular/core';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { city, statename } from './citylist';
declare const google;

@disableSideMenu()
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit, OnChanges {
  @Input() openLocation = false;
  @Input() clearLocation = false;
  @Output() locationFetch = new EventEmitter<any>();

  openState = false;
  openCity = false;
  modalInitialBr = 1;

  states: string[] = statename;
  cityList: any[] = city;
  filteredStates: string[] = [];
  filteredCities: any[] = [];
  cities: any[] = [];

  fromSelected = false;
  selectedPickState: string;
  selectedPickCities: string[] = [];
  selectedDropState: string;
  selectedDropCities: string[] = [];
  selectedState: string;
  selectedCities: string[] = [];
  locMode: string;
  googleAutocomplete: any;

  constructor(private modalController: ModalController)
  {
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
  }

  ngOnInit() {
    this.filteredStates = Array.from(this.states);
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.clearLocation && changes.clearLocation.currentValue)
    {
      this.fromSelected = false;
      this.selectedPickState = this.selectedDropState = null;
      this.selectedPickCities = []; this.selectedDropCities = [];
    }
  }

  filterCity(loc: string)
  {
    if(loc === 'pickCity')
    {
      this.selectedState = this.selectedPickState ? this.selectedPickState : null;
      this.selectedCities = this.selectedPickCities.length ? Array.from(this.selectedPickCities) : [];
    }
    else
    {
      this.selectedState = this.selectedDropState ? this.selectedDropState : null;
      this.selectedCities = this.selectedDropCities.length ? Array.from(this.selectedDropCities) : [];
    }

    if(this.selectedState)
    {
      this.openCity = true;
      this.filteredCities = [];
      /* this.cities = city.filter(c => c.state === this.selectedState);
      this.cities.unshift({city: 'All', state: 'All'});
      this.filteredCities = this.cities.filter((c, index, self) => index === self.findIndex((t) => t.city === c.city)); */
      this.locMode = loc;
    }
  }

  setStateCity(event: any, loc: string)
  {
    if(loc === 'state')
    {
      this.selectedState = event.target.value;
      this.selectedCities = [];
    }
    else if (loc === 'city' && event.target.checked)
    {
      if(event.target.value === 'All')
      {
        this.selectedCities.push(event.target.value);
        this.selectedCities = this.selectedCities.filter(c => c === 'All');
      }
      else
      {
        this.selectedCities.push(event.target.value);
        this.selectedCities = this.selectedCities.filter(c => c !== 'All');
      }
    }
    else
    {
      const index = this.selectedCities.indexOf(event.target.value);
      if(index !== -1) {
        this.selectedCities.splice(index, 1);
      }
    }
  }

  setLocation()
  {
    if(this.locMode === 'pickState')
    {
      this.selectedPickState = this.selectedState;
      this.selectedPickCities = ['All'];
      if(!this.selectedDropState) {
        this.selectedDropState = 'All';
      }
      if(!this.selectedDropCities.length) {
        this.selectedDropCities = ['All'];
      }

      this.resetStates();
    }
    else if(this.locMode === 'pickCity') {
      this.selectedPickCities = Array.from(this.selectedCities);
    }
    else if(this.locMode === 'dropState')
    {
      this.selectedDropState = this.selectedState;
      this.selectedDropCities = ['All'];
      this.resetStates();
    }
    else {
      this.selectedDropCities = Array.from(this.selectedCities);
    }

    if(this.selectedPickState && this.selectedPickCities.length) {
      this.fromSelected = true;
    }
  }

  getfilteredStates(event: any)
  {
    const searchedText: string = event.target.value;

    this.filteredStates = this.states.filter((s: string) => s.toLowerCase().includes(searchedText.toLowerCase()));
  }

  getfilteredCities(event: any)
  {
    const searchedText: string = event.target.value;

    this.filteredCities = this.cities.filter((c: any) => c.city.toLowerCase().includes(searchedText.toLowerCase()));
  }

  resetStates() {
    this.filteredStates = Array.from(this.states);
  }

  resetCities() {
    this.filteredCities = Array.from(this.cities);
  }

  getPlacesPredictions(event: any)
  {
    const searchTerm = event.target.value;

    if (searchTerm === '') {
      return;
    }

    const config = {
      input: searchTerm,
      componentRestrictions: {
        country: ['us']
      }
    };

    this.googleAutocomplete.getPlacePredictions(config, (data) => {
      if (data)
      {
        this.filteredCities = data;
        this.filteredCities.unshift({description: 'All'});
      }
      else {
        this.filteredCities = [];
      }
    });
  }

  setCities(googleCity: string)
  {
    const refactoredCity = googleCity?.split(',')[0];
    if(refactoredCity === 'All') {
      this.selectedCities = [];
    }
    else
    {
      const i = this.selectedCities.findIndex(c => c === 'All');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      i !== -1 ? this.selectedCities.splice(i, 1) : null;
    }

    const index = this.selectedCities.findIndex(c => c === refactoredCity);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    index === -1 ? this.selectedCities.push(refactoredCity) : null;
  }

  removeCity(c: string)
  {
    const index = this.selectedCities.indexOf(c);
    if(index !== -1) {
      this.selectedCities.splice(index, 1);
    }
  }

  closeModal(isDataSelected)
  {
    if(isDataSelected) {
      this.locationFetch.emit({
        fromState: this.selectedPickState,
        fromCity: this.selectedPickCities,
        toState: this.selectedDropState,
        toCity: this.selectedDropCities
      });
    }
    else {
      this.locationFetch.emit(null);
    }
  }
}

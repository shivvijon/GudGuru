import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { disableSideMenu } from '../decorators/side-menu.decorator';
import { EventEmitter } from '@angular/core';
import { city, statename } from '../location/citylist';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { RangeCustomEvent } from '@ionic/angular';
declare const google;

@disableSideMenu()
@Component({
  selector: 'app-truck-filter',
  templateUrl: './truck-filter.component.html',
  styleUrls: ['./truck-filter.component.scss'],
})
export class TruckFilterComponent implements OnInit, OnChanges {

  @Input() openLocation = false;
  @Input() clearFilter = false;
  @Output() filterChange = new EventEmitter<any>();

  openState = false;
  openCity = false;
  modalInitialBr = 1;

  states: string[] = statename;
  cityList: any[] = city;
  filteredStates: string[] = [];
  filteredCities: any[] = [];
  cities: any[] = [];

  selectedState: string;
  finalState: string;
  selectedCities: string[] = [];
  finalCities: string[] = [];
  selectedMinDatetime: any;
  selectedMaxDatetime: any;
  truckForm: FormGroup;
  openMinDatetime = false;
  openMaxDatetime = false;
  minMiles: any[] = [{name: '0', value: 0}, {name: '1,00,000', value: 100000}, {name: '2,00,000', value: 200000},
                    {name: '3,00,000', value: 300000}, {name: '4,00,000', value: 400000}, {name: '5,00,000', value: 500000},
                    {name: '6,00,000', value: 600000}, {name: '7,00,000', value: 700000}, {name: '8,00,000', value: 800000},
                    {name: '9,00,000', value: 900000}];

  maxMiles: any[] = [{name: '1,00,000', value: 100000}, {name: '2,00,000', value: 200000}, {name: '3,00,000', value: 300000},
                    {name: '4,00,000', value: 400000}, {name: '5,00,000', value: 500000}, {name: '6,00,000', value: 600000},
                    {name: '7,00,000', value: 700000}, {name: '8,00,000', value: 800000}, {name: '9,00,000', value: 900000},
                    {name: '10,00,000', value: 1000000}];
  price = {
    min: 0,
    max: 0
  };
  googleAutocomplete: any;

  constructor()
  {
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.truckForm = new FormGroup({
      minMiles: new FormControl(null),
      maxMiles: new FormControl(null),
      minYear: new FormControl(null),
      maxYear: new FormControl(null),
    });
  }

  pinFormatter(value: number) {
    return `$${value}`;
  }

  ngOnInit() {
    this.filteredStates = Array.from(this.states);
    this.selectedMinDatetime = moment().format('YYYY');
    this.selectedMaxDatetime = moment().format('YYYY');
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.clearFilter && changes.clearFilter.currentValue)
    {
      this.selectedState = this.finalState = null;
      this.finalCities = [];
      this.selectedCities = [];
      this.price = {min: 0, max: 0};
      this.truckForm.patchValue({
        minMiles: null,
        maxMiles: null,
        minYear: null,
        maxYear: null
      });
      this.selectedMinDatetime = moment().format('YYYY');
      this.selectedMaxDatetime = moment().format('YYYY');
    }
  }

  setDatetime(event, yearType)
  {
    if(yearType === 'min') {
      this.selectedMinDatetime = event.target.value;
    }
    else {
      this.selectedMaxDatetime = event.target.value;
    }

    console.log(this.selectedMinDatetime);
  }

  patchDatetime(yearType)
  {
    if(yearType === 'min')
    {
      const selDate = moment(this.selectedMinDatetime).format('YYYY');
      this.truckForm.patchValue({minYear: selDate});
      this.openMinDatetime = false;
    }
    else
    {
      const selDate = moment(this.selectedMaxDatetime).format('YYYY');
      this.truckForm.patchValue({maxYear: selDate});
      this.openMaxDatetime = false;
    }
  }

  filterCity()
  {
    this.selectedState = this.finalState ? this.finalState : null;
    this.selectedCities = this.selectedCities.length ? Array.from(this.selectedCities) : [];

    if(this.selectedState)
    {
      this.openCity = true;
      this.filteredCities = [];
      /* this.cities = city.filter(c => c.state === this.selectedState);
      this.cities.unshift({city: 'All', state: 'All'});
      this.filteredCities = this.cities.filter((c, index, self) => index === self.findIndex((t) => t.city === c.city)); */
    }
  }

  setStateCity(event: any, loc: string)
  {
    if(loc === 'state')
    {
      this.selectedState = event.target.value;
      this.selectedCities = this.finalCities.length ? Array.from(this.finalCities) : [];
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

  setTruck()
  {
    this.finalState = this.selectedState;
    this.finalCities = ['All'];
    this.selectedCities = ['All'];
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

  setCity() {
    this.finalCities = this.selectedCities;
  }

  clearCity() {
    this.selectedCities = Array.from(this.finalCities);
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
        country: ['us', 'ca']
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

  setPrice(event: Event)
  {
    const price: any = (event as RangeCustomEvent).detail.value;
    this.price.min = price.lower;
    this.price.max = price.upper;
  }

  closeModal(isDataSelected)
  {
    if(isDataSelected) {
      this.filterChange.emit({
        minYear: this.truckForm.value.minYear,
        maxYear: this.truckForm.value.maxYear,
        minMiles: this.truckForm.value.minMiles,
        maxMiles: this.truckForm.value.maxMiles,
        price: this.price,
        state: this.finalState,
        city: this.finalCities
      });
    }
    else {
      this.filterChange.emit(null);
    }
  }

}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { statename, city } from '../location/citylist';

@Component({
  selector: 'app-truck-part-filter',
  templateUrl: './truck-part-filter.component.html',
  styleUrls: ['./truck-part-filter.component.scss'],
})
export class TruckPartFilterComponent implements OnInit, OnChanges {

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

  selectedState: string[] = [];
  selectedCities: string[] = [];
  selectedMinDatetime: any;
  selectedMaxDatetime: any;
  truckForm: FormGroup;
  openMinDatetime = false;
  openMaxDatetime = false;

  constructor()
  {
    this.truckForm = new FormGroup({
      make: new FormControl(null),
      minYear: new FormControl(null),
      maxYear: new FormControl(null)
    });
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
      this.selectedState = [];
      this.selectedCities = [];
      this.truckForm.patchValue({
        make: null,
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

  filterState()
  {
    this.selectedState = this.selectedState.length ? Array.from(this.selectedState) : [];
    this.selectedCities = this.selectedCities.length ? Array.from(this.selectedCities) : [];

    this.filteredStates = this.states.filter((c, index, self) => index === self.findIndex((t) => t === c));
    this.filteredStates.unshift('All');

    /* if(this.selectedState)
    {
      this.openCity = true;
      this.cities = city.filter(c => c.state === this.selectedState);
      this.cities.unshift({city: 'All', state: 'All'});
      this.filteredCities = this.cities.filter((c, index, self) => index === self.findIndex((t) => t.city === c.city));
    } */
  }

  setStateCity(event: any, loc: string)
  {
    if(loc === 'state' && event.target.checked)
    {
      if(event.target.value === 'All')
      {
        this.selectedState.push(event.target.value);
        this.selectedState = this.selectedState.filter(c => c === 'All');
      }
      else
      {
        this.selectedState.push(event.target.value);
        this.selectedState = this.selectedState.filter(c => c !== 'All');
      }
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
      const index = this.selectedState.indexOf(event.target.value);
      if(index !== -1) {
        this.selectedState.splice(index, 1);
      }
    }
  }

  setTruck()
  {
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

  clearStates()
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.filteredStates[0] === 'All' ? this.filteredStates.shift() : null;
    this.selectedState = [];
  }

  closeModal(isDataSelected)
  {
    if(isDataSelected) {
      this.filterChange.emit({
        minYear: this.truckForm.value.minYear,
        maxYear: this.truckForm.value.maxYear,
        make: this.truckForm.value.make,
        state: this.selectedState
        /* miles: this.truckForm.value.miles,
        price: this.truckForm.value.price,
        state: this.selectedState,
        city: this.selectedCities */
      });
    }
    else {
      this.filterChange.emit(null);
    }
  }

}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { statename, city } from 'src/app/location/citylist';

@Component({
  selector: 'app-ifta-filter',
  templateUrl: './ifta-filter.component.html',
  styleUrls: ['./ifta-filter.component.scss'],
})
export class IftaFilterComponent implements OnInit, OnChanges {

  @Input() openLocation = false;
  @Input() clearFilter = false;
  @Input() title = 'Find Fuel Refills';
  @Input() truckNumbers = [];
  @Output() filterChange = new EventEmitter<any>();

  openState = false;
  openCity = false;
  openTruck = false;
  modalInitialBr = 1;

  states: string[] = statename;
  cityList: any[] = city;
  filteredStates: string[] = [];
  filteredCities: any[] = [];
  filteredTrucks: any[] = [];
  cities: any[] = [];

  selectedState: string[] = [];
  selectedCities: string[] = [];
  selectedTrucks: string[] = [];
  selectedDatetime: any;
  /* selectedMinDatetime: any;
  selectedMaxDatetime: any; */
  fuelForm: FormGroup;
  openDatetime = false;
  /* openMinDatetime = false;
  openMaxDatetime = false; */

  constructor()
  {
    this.fuelForm = new FormGroup({
      quarter: new FormControl(null),
      year: new FormControl(null),
      /* maxYear: new FormControl(null) */
      /* truck: new FormControl(null) */
    });
  }

  ngOnInit() {
    this.filteredStates = Array.from(this.states);
    this.selectedDatetime = moment().format('YYYY');
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.clearFilter && changes.clearFilter.currentValue)
    {
      this.selectedState = [];
      this.selectedCities = [];
      this.selectedTrucks = [];
      this.fuelForm.patchValue({
        quarter: null,
        year: null,
        /* truck: null */
      });
      this.selectedDatetime = moment().format('YYYY');
    }
  }

  setDatetime(event)
  {
    this.selectedDatetime = event.target.value;
    console.log(this.selectedDatetime);
  }

  patchDatetime()
  {
    const selDate = moment(this.selectedDatetime).format('YYYY');
    this.fuelForm.patchValue({year: selDate});
    this.openDatetime = false;
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

  filterTruck()
  {
    this.selectedTrucks = this.selectedTrucks.length ? Array.from(this.selectedTrucks) : [];

    this.filteredTrucks = this.truckNumbers.filter((c, index, self) => index === self.findIndex((t) => t === c));
    this.filteredTrucks.unshift('All');
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

  setTrucks(event: any)
  {
    if(event.target.checked)
    {
      if(event.target.value === 'All')
      {
        this.selectedTrucks.push(event.target.value);
        this.selectedTrucks = this.selectedTrucks.filter(t => t === 'All');
      }
      else
      {
        this.selectedTrucks.push(event.target.value);
        this.selectedTrucks = this.selectedTrucks.filter(c => c !== 'All');
      }
    }
    else
    {
      const index = this.selectedTrucks.indexOf(event.target.value);
      if(index !== -1) {
        this.selectedTrucks.splice(index, 1);
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

  getfilteredTrucks(event: any)
  {
    const searchedText: string = event.target.value;

    this.filteredTrucks = this.truckNumbers.filter((t: string) => t.toLowerCase().includes(searchedText.toLowerCase()));
  }

  resetStates() {
    this.filteredStates = Array.from(this.states);
  }

  resetCities() {
    this.filteredCities = Array.from(this.cities);
  }

  resetTrucks() {
    this.filteredTrucks = Array.from(this.truckNumbers);
  }

  clearStates()
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.filteredStates[0] === 'All' ? this.filteredStates.shift() : null;
    this.selectedState = [];
  }

  clearTrucks()
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.filteredTrucks[0] === 'All' ? this.filteredTrucks.shift() : null;
    this.selectedTrucks = [];
  }

  closeModal(isDataSelected)
  {
    if(isDataSelected) {
      this.filterChange.emit({
        quarter: this.fuelForm.value.quarter,
        year: this.fuelForm.value.year,
        truck: this.selectedTrucks,
        state: this.selectedState
      });
    }
    else {
      this.filterChange.emit(null);
    }
  }

}

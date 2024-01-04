import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { EmergencyLoadService } from 'src/app/services/api/emergency-load.service';
import { LoadService } from 'src/app/services/api/load.service';

@Component({
  selector: 'app-view-load',
  templateUrl: './view-load.page.html',
  styleUrls: ['./view-load.page.scss'],
})
export class ViewLoadPage implements OnInit {

  load: any;
  maps: any;
  mapMarkers: google.maps.Marker[] = [];
  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;
  time: string;
  totalDistance: string;
  perDistance = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: LoadService,
    public emergency: EmergencyLoadService,
    private loader: LoadingController
  )
  {
    route.queryParams.subscribe(param => {
      if(router.getCurrentNavigation().extras.state) {
        this.load = router.getCurrentNavigation().extras.state;
        this.loadMap();
      }
    });
  }

  ngOnInit() {
  }

  loadMap()
  {
    setTimeout(() => {
      this.initDirections();
    });

  }

  initDirections()
  {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    this.maps = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 41.850033, lng: -87.6500523}, // Chicago
      zoom: 5
    });

    this.directionsRenderer.setMap(this.maps);
    this.getDirections();
  }

  getDirections()
  {
    this.presentLoader();
    const request = {
      origin: this.load.from.city + ',' + this.load.from.state,
      destination: this.load.to.city + ',' + this.load.to.state,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    };

    this.directionsService.route(request, (result, status) => {
      this.loader.dismiss();
      if (status === 'OK') {
        console.log(result);
        this.directionsRenderer.setDirections(result);
        this.time = result.routes[0].legs[0].duration.text;
        this.totalDistance = result.routes[0].legs[0].distance.text;
        this.totalDistance = this.totalDistance.split(' ')[0].replaceAll(',', '');
        this.perDistance = Math.round(((parseFloat(this.load.price) / parseFloat(this.totalDistance)) + Number.EPSILON) * 100) / 100;
      }
    });
  }

  async presentLoader()
  {
    const load = await this.loader.create({
      spinner: 'crescent',
      message: 'Loading directions, please wait...',
      backdropDismiss: false
    });

    await load.present();
  }

  callLoad(contact: string)
  {
    const a = document.createElement('a');
    a.href = 'tel:' + contact;
    a.click();
  }

}

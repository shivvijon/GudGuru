import { Injectable, ApplicationRef } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { NativeGeocoder, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { MapsAPILoader } from '@agm/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { GeolocationService } from 'geolocation-service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EmergencyLoadService {

  openEmergencyModal = false;
  currentLocation: string;
  currentState: string;
  currentCity: string;
  notificationDistance: number = null;
  location = {
    lat: '',
    long: '',
  };
  isLocationProcess = false;
  isLoadRequestSent = false;
  placesList: any[] = [];
  placeId: string = null;
  locationSearched = false;

  private loadOnStart = false;
  private placesService: any;
  private geocoder: any;
  private options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  locationUpates = {
    latitude: -1,
    longitude: -1
  };

  locationTimer: number = 10000;
  locationInterval: any;
  isLocationUpdateStarted: boolean;

  constructor(
    private nativeGeocoder: NativeGeocoder,
    private mapsAPILoader: MapsAPILoader,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private diagnostic: Diagnostic,
    private ar: ApplicationRef,
    private api: AuthService
  )
  {
    mapsAPILoader.load().then(() => {
      this.placesService = new google.maps.places.AutocompleteService();
      this.geocoder = new google.maps.Geocoder();
    });
  }

  // Register event that listens to location state change
  registerLocationStateChange()
  {
    this.diagnostic.registerLocationStateChangeHandler((state) => {
      if(state === 'location_off' && this.openEmergencyModal) {
        this.openEmergencyModal = false;
        this.ar.tick();
      }

      console.log('Loc State Change if---->');

      this.stopLocationUpdates();
      if(this.openEmergencyModal) {
        this.checkPermission();
      }
      else {
        this.checkPermission(true);
      }
    });
  }

  // Start background service that keeps track of users current location
  listenBackgroundLocationChange()
  {
    this.diagnostic.getLocationAuthorizationStatus().then((status) => {
      if(status && status !== 'authorized') {
        this.presentBackgroundPermissionAlert();
      }
    })
    .catch((err) => {
      console.error(err);
    });

    GeolocationService.startTracking({
      title: 'App is tracking your location',
      subTitle: 'Background location tracking helps in emergency request notifications.',
      interval: 10000
    },
    (location) => {
      console.log(location);
      this.locationUpates.latitude = location.latitude;
      this.locationUpates.longitude = location.longitude;
      if(!this.isLocationUpdateStarted) {
        this.startLocationUpdates();
      }
    })
    .then((message) => {
      console.log(message);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  // Request Background Location Permission Settings
  requestBackgroundLocationPermissionSettings()
  {
    this.diagnostic.requestLocationAuthorization('always')
    .then(() => {})
    .catch((err) => {console.error(err);});
  }

  // Check for background permission and prompt user to enable it
  async presentBackgroundPermissionAlert()
  {
    const alert = await this.alertController.create({
      header: 'Enable Background Location Service',
      message: 'This app needs location access in the background for emergency request notification. ' +
               'To continue location services in background, change App\'s location permission settings to ' +
               'Allow All The Time or Always inside device\'s location settings',
      backdropDismiss: false,
      buttons: [{
        text: 'OKAY, GOT IT!',
        handler: () => this.requestBackgroundLocationPermissionSettings()
      }]
    });

    await alert.present();
  }

  // Checks for Location Permission
  checkPermission(loadOnStart: boolean = false)
  {
    this.loadOnStart = loadOnStart;
    this.placesList = [];
    this.placeId = null;
    this.currentLocation = null;
    this.notificationDistance = null;
    this.isLocationProcess = true;
    this.locationSearched = false;

    this.diagnostic.isLocationAvailable().then(async (resp) => {
      if(!resp) 
      {
        this.diagnostic.isLocationEnabled().then(async (locState) => {
          if(!locState) {
            const alert = await this.alertController.create({
              header: 'Location services are disabled',
              message: 'This app needs location access. Enable it by navigating to Settings ---> Privacy & Security ---> ' + 
                        'Location Services.',
              backdropDismiss: false,
              buttons: [{
                text: 'OKAY, GOT IT!',
                handler: () => this.requestLocationAccess()
              }]
            });
        
            await alert.present();
          }
          else {
            this.requestLocationAccess();
          }
        })
      }
      else {
        this.getCurrentCoordinates();
      }
    })
  }

  requestLocationAccess()
  {
    this.diagnostic.requestLocationAuthorization().then(() => {})
    .catch((err) => {})   
  }

  // Fetch current coordinates
  async getCurrentCoordinates()
  {
    console.log('Loading Started----->');
    if(this.loadOnStart) {
      await this.presentLoading();
    }
    else {
      this.openEmergencyModal = true;
    }

    Geolocation.getCurrentPosition().then(result => {
      this.location.lat = result.coords.latitude + '';
      this.location.long = result.coords.longitude + '';
      this.getReversedLocation(result);
    })
    .catch((err) => {
      console.log('Error fetching location--->', err);
      this.loadingController.dismiss();
      this.isLocationProcess = false;
    });
  }

  // Decode Lat and Long to get location
  getReversedLocation(location: any, canStartService: boolean = true)
  {
    this.nativeGeocoder.reverseGeocode(location.coords.latitude, location.coords.longitude, this.options)
    .then(async (result) => {
      this.currentLocation = this.getFormattedLocation(result[0]);
      this.ar.tick();
      this.isLocationProcess = false;

      if(this.loadOnStart) {
        setTimeout(async () => {
          await this.loadingController.dismiss();
        }, 100);
      }

      if(canStartService) {
        this.listenBackgroundLocationChange();
      }
    })
    .catch((err) => {
      console.error('Error Parsing Location--->', err);
      this.isLocationProcess = false;
      this.loadingController.dismiss();
    });
  }

  // Return formatted location
  getFormattedLocation(locParts: any): string
  {
    const addressParts = [];

    Object.keys(locParts).forEach(key => {
      if(locParts[key].length && (key !== 'latitude' && key !== 'longitude'))
      {
        addressParts.unshift(locParts[key]);
        if(key === 'administrativeArea') {
          this.currentState = locParts[key];
        }
        else if(key === 'subAdministrativeArea') {
          this.currentCity = locParts[key];
        }
      }
    });

    if(!this.currentCity?.length) {
      this.currentCity = locParts.locality;
    }

    return addressParts.join(', ');
  }

  getPlacesPredictions(event)
  {
    this.locationSearched = true;
    const key = event.target.value;
    if (!key?.length)
    {
      this.placesList = [];
      return;
    }

    this.placesService.getPlacePredictions({input: key}, (data) => {

      if (data?.length) {
        this.placesList = data;
      } else {
        this.placesList = [];
      }
    });
  }

  setSelectedPlace(placeId: string)
  {
    this.isLocationProcess = true;
    this.currentLocation = null;
    this.placeId = placeId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.geocoder.geocode({placeId}).then((geoResult) => {
      this.location.lat = geoResult.results[0].geometry.location.lat() + '';
      this.location.long = geoResult.results[0].geometry.location.lng() + '';
      const location = {
        coords: {
          latitude: geoResult.results[0].geometry.location.lat(),
          longitude: geoResult.results[0].geometry.location.lng()
        }
      };

      this.getReversedLocation(location, false);
      this.placeId = null;
      this.placesList = [];
      this.locationSearched = false;
    });
  }

  setNotificationDistance(event) {
    this.notificationDistance = event.target?.value;
  }

  async presentLoading()
  {
    const loader = await this.loadingController.create({
      message: 'Fetching coordinates',
      mode: 'md',
      spinner: 'dots',
      backdropDismiss: false
    });

    loader.present();
  }

  // Start Locationn updates to server
  startLocationUpdates()
  {
    clearInterval(this.locationInterval);
    this.isLocationUpdateStarted = true;
    this.locationInterval = setInterval(() => {
      if(this.locationUpates.latitude && this.locationUpates.longitude) {
        this.api.updateLocation(this.locationUpates).subscribe(() => {});
      }
    }, this.locationTimer);
  }

  stopLocationUpdates() {
    clearInterval(this.locationInterval);
    this.isLocationUpdateStarted = false;
  }
}

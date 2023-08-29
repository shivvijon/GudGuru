// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /* apiBaseUrl: 'https://api.gudguru.com/api/v1', */
  apiBaseUrl: 'http://localhost:5000/api/v1',
  /* socketUrl: 'https://api.gudguru.com', */
  socketUrl: 'http://localhost:5000',
  imageUrl: 'https://api.gudguru.com/api/v1/uploads/',
  /* imageUrl: 'http://192.168.1.17:5000/api/v1/uploads/', */
  googleAPIKey: 'AIzaSyC8YK4C4My-RK-1VniQ6a2hOQzPeA88CNU',
  stripeKey: 'pk_test_51M4z8kGpPauB6Gta2TjUCkxjAcLGWQD6WD9RFCFTkI2ePUExjVIsJy6qx0gZH6PS3gXOINRCOgfad0uZProbBlQe00JaudHlVu',
  policyUrl: 'https://gudguru.com/policy',
  termsUrl: 'https://gudguru.com/term',
  platinumId: 'platinum_plan_monthly_999',
  countryCode: '+91'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

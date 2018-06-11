import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';
//import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    Ng4GeoautocompleteModule.forRoot(),
    IonicPageModule.forChild(SignupPage),
    TranslateModule.forChild()
  ],
  exports: [
    SignupPage
  ],
  providers: [
    NativeGeocoder
    //Geolocation
  ]
})
export class SignupPageModule { }

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditprofilePage } from './editprofile';
import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';

@NgModule({
  declarations: [
    EditprofilePage,
  ],
  imports: [
    Ng4GeoautocompleteModule.forRoot(),
    IonicPageModule.forChild(EditprofilePage),
  ],
})
export class EditprofilePageModule {}

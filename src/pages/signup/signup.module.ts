import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
//import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    //CommonModule,
    IonicPageModule.forChild(SignupPage),
    TranslateModule.forChild()
  ],
  exports: [
    SignupPage
  ]
})
export class SignupPageModule { }

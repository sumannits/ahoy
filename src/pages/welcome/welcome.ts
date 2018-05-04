import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  public isUserLogin:string=localStorage.getItem("isUserLogedin");
  public loguser:any;
  constructor(public navCtrl: NavController,private myApp:MyApp) { }

  login() {
    this.navCtrl.push('LoginPage');
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  ionViewDidLoad() {
    //this.loguser = JSON.parse(localStorage.getItem('userData'));
    this.myApp.menuOpened();
  }

  public home() {
    //this.navCtrl.push('WelcomePage');
    this.navCtrl.setRoot('WelcomePage');
  }
  
  public userLogout() {
    localStorage.clear();
    localStorage.removeItem("isUserLogedin");
    localStorage.removeItem("userData");
    localStorage.removeItem("userPrfDet");
    this.navCtrl.push('LoginPage');
  }
}

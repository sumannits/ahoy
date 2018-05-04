import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, LoadingController ,Events, ToastController, MenuController } from 'ionic-angular';
import { AuthServiceProvider } from '../providers';
//import { FirstRunPage } from '../pages';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage = FirstRunPage;
  @ViewChild(Nav) nav: Nav;

  public rootPage: any;
  public pages: Array<{ title: string, icon: string, component: any }>;
  public user_fname:string='';
  public name:string = '';
  public profile_image:string='';
  public isloggedin : boolean = false;
  public loguser:any;
  public loguserDet:any;
  
  constructor(
    private translate: TranslateService, 
    private platform: Platform, 
    private getService: AuthServiceProvider,
    private config: Config, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen,
    //public toastCtrl:ToastController,
    public loadingCtrl: LoadingController,
    public menuCtrl: MenuController
  ) {
    this.presentLoadingCustom();
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.menuOpened();
      this.nav.setRoot('WelcomePage');
    });
    //this.initTranslate();
    this.initializeApp();
    this.pages = [
      { title: 'Splash Page', icon: 'cog', component:  'SplashPage' },
      { title: 'Welcome Page',icon:'people',component: 'WelcomePage'},
      { title: 'Signup Page', icon: 'people', component: 'SignupPage' },
      { title: 'Login Page', icon: 'key', component: 'LoginPage' },
      //{ title: 'Profile Page', icon: 'key', component: 'ProfilePage' },
      { title: 'Settings Page', icon: 'key', component: 'SettingsPage' },
      { title: 'Editprofile Page', icon: 'key', component: 'EditprofilePage' },
      //{ title: 'InboxPage Page', icon: 'key', component: 'InboxPage' },
      //{ title: 'NotificationSettings Page', icon: 'key', component: 'NotificationSettingsPage' }
    ];
  }

  /*initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();

    if (browserLang) {
      if (browserLang === 'zh') {
        const browserCultureLang = this.translate.getBrowserCultureLang();

        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translate.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translate.use('zh-cmn-Hant');
        }
      } else {
        this.translate.use(this.translate.getBrowserLang());
      }
    } else {
      this.translate.use('en'); // Set your language here
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }*/

  initializeApp() {
    this.splashScreen.hide();
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });  
  }

  menuOpened(){
      this.loguser = JSON.parse(localStorage.getItem('userData'));
      //console.log(this.loguser);
      if(this.loguser){
        this.isloggedin = true;
        this.loguserDet = JSON.parse(localStorage.getItem('userPrfDet'));
        if(this.loguserDet.image){
          this.profile_image = this.loguserDet.image;
        }else{
          this.profile_image = 'assets/img/default.jpeg';
        }
        //this.profile_image = 'assets/img/default.jpeg';
        if(this.loguserDet.name){
          let userFname= this.loguserDet.name.split(" ");
          if(userFname[0]){
            this.user_fname = userFname[0];
          }else if(userFname[1]){
            this.user_fname = userFname[1];
          }
        }
        // this.rootPage = 'WelcomePage';
        
      }else{
        // this.rootPage = 'WelcomePage';
        this.profile_image = 'assets/img/default.jpeg';
        this.user_fname = '';
        this.isloggedin = false;
      }
    
      //console.log(this.isloggedin);
  }
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  presentLoadingCustom() {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: `
        <div class="custom-spinner-container">
          <div class="custom-spinner-box"></div>
        </div>`,
      duration: 5000
    });
  }

  login() {
    this.nav.setRoot('LoginPage');
  }

  public logout(){
    localStorage.clear();
    // this.profile_image = 'assets/img/default.jpeg';
    // this.name = '';
    this.isloggedin = false;
    // this.nav.setRoot('LoginPage');
    localStorage.removeItem("isUserLogedin");
    localStorage.removeItem("userData");
    localStorage.removeItem("userPrfDet");
    this.nav.setRoot('LoginPage');
  }
 
  public goToDestinationFromSidebar(location){
    if(location==0){
      this.nav.setRoot('ProfilePage');
    }
    if(location==1){
      this.nav.setRoot('WelcomePage');
    }
    if(location==2){
      this.nav.setRoot('WelcomePage');
    }
    
    if(location==7){
    this.nav.push('EditprofilePage');
    }
    /*if(location==8){
    this.nav.setRoot('ChangePasswordPage');
    }
    if(location==12){
    this.nav.setRoot('NotificationSettingsPage');
    }
    if(location==13){
    this.nav.setRoot('NotificationsPage');
    }
    if (location == 14) {
      this.nav.setRoot('MessageDetailsPage');
    }
    if (location == 15) {
      this.nav.setRoot('ChangePassPage');
    }*/
    if (location == 16) {
      this.nav.setRoot('SignupPage');
    }
    
  }
}


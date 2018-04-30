import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, LoadingController ,Events, ToastController } from 'ionic-angular';
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
  
  constructor(
    private translate: TranslateService, 
    private platform: Platform, 
    private getService: AuthServiceProvider,
    private config: Config, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen,
    //public toastCtrl:ToastController,
    public loadingCtrl: LoadingController,
    //public events: Events,
  ) {
    this.presentLoadingCustom();
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      const loguser = JSON.parse(localStorage.getItem('userData'));
      if(loguser){
        // this.rootPage = 'WelcomePage';
        // this.profile_image = loguser.profile_image;
        // this.name = loguser.first_name + ' ' + loguser.last_name;
        this.isloggedin = true;
      }else{
        // this.rootPage = 'WelcomePage';
        // this.profile_image = 'assets/img/default.jpeg';
        // this.name = '';
        this.isloggedin = false;
      }
      this.nav.setRoot('WelcomePage');
    });
    //this.initTranslate();
    this.initializeApp();
    this.pages = [
      { title: 'Splash Page', icon: 'cog', component:  'SplashPage' },
      { title: 'Welcome Page',icon:'people',component: 'WelcomePage'},
      { title: 'Signup Page', icon: 'people', component: 'SignupPage' },
      { title: 'Login Page', icon: 'key', component: 'LoginPage' },
      { title: 'Profile Page', icon: 'key', component: 'ProfilePage' },
      //{ title: 'ForgotPassword Page', icon: 'key', component: 'ForgotPasswordPage' },
      //{ title: 'NotificationsPage Page', icon: 'key', component: 'NotificationsPage' },
      //{ title: 'EditProfilePage Page', icon: 'key', component: 'EditProfilePage' },
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
    if(location==4){
        this.nav.setRoot('InboxPage');
    }
    if(location==7){
    this.nav.setRoot('EditProfilePage');
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


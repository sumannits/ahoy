import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, AlertController} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Device } from '@ionic-native/device';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  private form: FormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  private loginErrorString: string;
  private responseData: any;

  constructor(
    public navCtrl: NavController,
    public userService: AuthServiceProvider,
    public toastCtrl: ToastController,
    private fbuilder: FormBuilder,
    public alertCtrl: AlertController,
    public jsonErrMsg: ResponseMessage,
    //private device: Device
  ) {
    this.form = fbuilder.group({
      'email': ['', Validators.compose([Validators.required,Validators.email])],
      'password': ['', Validators.compose([Validators.required])],
    });
    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
  }

  // Attempt to login in through our User service
  doLogin() {
    

    let CheckvalidEmail = this.email.value.toString();
    let isValidEmail = this.validateEmail(CheckvalidEmail);
    if (this.form.valid && isValidEmail) {
      let signinJsonData={
        "email": this.email.value.toString(),
        "password": this.password.value.toString(),
        //"deviceToken": this.device.uuid,
        //"deviceType": this.device.platform
      };
      this.userService.postData(signinJsonData,'Customers/login').then((result) => {
        //console.log(result);
        this.responseData = result;
        if(this.responseData.id){
          let userId= this.responseData.userId
          this.userService.getData('Customers/'+userId).then((result) => {
            localStorage.setItem('userPrfDet', JSON.stringify(result));
          }, (err) => {
            let alert = this.alertCtrl.create({
              title: 'Error!',
              subTitle: this.jsonErrMsg.messageData(err),
              buttons: ['Ok']
            });
            alert.present();
          });  
          localStorage.setItem('userData', JSON.stringify(this.responseData));
          localStorage.setItem('isUserLogedin', '1');
          let toast = this.toastCtrl.create({
            message: 'You have successfully login.',
            duration: 4000,
            position: 'top'
          });
          toast.present();
          this.navCtrl.setRoot('WelcomePage');
        }else{
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: 'Something wrong.Please try again.' ,
            buttons: ['Ok']
          });
          alert.present();
        }
      }, (err) => {
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: this.jsonErrMsg.messageData(err),
          buttons: ['Ok']
        });
        alert.present();
      });
    }else if(!isValidEmail){
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Please enter valid email',
        buttons: ['Ok']
      });
      alert.present();
    }else{
      let toast = this.toastCtrl.create({
        message: 'You enter wrong email and password',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }
  }

  public validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public gotoSignupPage(){
    this.navCtrl.push('SignupPage');
  }

  forgotpassword(){
    //this.navCtrl.push('ForgotPasswordPage');
    //his.navCtrl.setRoot('ForgotPasswordPage');
  }
}

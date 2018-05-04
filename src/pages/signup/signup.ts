import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, AlertController} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Device } from '@ionic-native/device';


function duplicatePassword(input: FormControl) {
  if (!this.input.root || !this.input.root.controls) {
    return null;
  }

  const exactMatch = this.input.root.controls.password.value === this.input.value;
  return exactMatch ? null : { mismatchedPassword: true };
}

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  
  // Our translated text strings
  private signupErrorString: string;
  private signupTitleString: string = 'Signup';
  private form: FormGroup;
  private responseData: any;
  private error: string;
  private busy: boolean;
  private isNextFrm:boolean=false;
  private checkEmailExist:boolean=true;

  public email: AbstractControl;
  public password: AbstractControl;
  public cpassword: AbstractControl;
  public username: AbstractControl; 

  constructor(public navCtrl: NavController,
    public userService: AuthServiceProvider,
    public toastCtrl: ToastController,
    private fbuilder: FormBuilder,
    public alertCtrl: AlertController,
    public translateService: TranslateService,
    public jsonErrMsg: ResponseMessage,
    //private device: Device
  ) {
    this.form = fbuilder.group({
      'username': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required,Validators.email])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      'cpassword': ['', Validators.compose([Validators.required])],
      'interested'     : fbuilder.array([ this.initInterestedFields() ])
    });

    this.username = this.form.controls['username'];
    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
    this.cpassword = this.form.controls['cpassword'];

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })
  }

  initInterestedFields() : FormGroup{
    return this.fbuilder.group({
        name : ['']
        //name : ['', Validators.required]
    });
  }

  addNewInputField() : void{
    const control = <FormArray>this.form.controls.interested;
    control.push(this.initInterestedFields());
  }

  removeInputField(i : number) : void{
    const control = <FormArray>this.form.controls.interested;
    control.removeAt(i);
  }

  doSignup(val : any) {
    if (this.form.valid) {
      let signupJsonData={
        "name": this.username.value.toString(),
        //"username": this.username.value.toString(),
        "email": this.email.value.toString(),
        "password": this.password.value.toString(),
        "interested":this.form.controls['interested'].value,
        "is_active": true,
        "emailVerified": true,
        //"deviceToken": this.device.uuid,
        //"deviceType": this.device.platform
      };
      this.userService.postData(signupJsonData,'Customers').then((result) => {
        //console.log(result);
        this.responseData = result;
        if(this.responseData.id){
          let toast = this.toastCtrl.create({
            message: 'You have successfully signup.Please Login.',
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

      /*this.userService.signup(this.account).subscribe((resp) => {
        this.navCtrl.push(MainPage);
      }, (err) => {
  
        this.navCtrl.push(MainPage);
  
        // Unable to sign up
        let toast = this.toastCtrl.create({
          message: this.signupErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });*/
    }
    //console.log(val);
    //console.log(val.interested);
  }
  public onLogin() {
    this.navCtrl.push('LoginPage');
  }

  public validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  public gotoNextSignup(){
    let password = this.password.value.toString();
    let cpassword = this.cpassword.value.toString();
    let CheckvalidEmail = this.email.value.toString();
    let isValidEmail = this.validateEmail(CheckvalidEmail);
    if(password==cpassword && isValidEmail){
      this.userService.postData({"email":CheckvalidEmail},'Customers/emailChecking').then((result) => {
        this.responseData=result;
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: this.responseData.response.message,
          buttons: ['Ok']
        });
        alert.present();
        this.isNextFrm=false;
      }, (err) => {
        let emailErrMsg= this.jsonErrMsg.messageData(err);
        if(emailErrMsg=='Email does not exist'){
          this.isNextFrm=true;
        }else{
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: this.jsonErrMsg.messageData(err),
            buttons: ['Ok']
          });
          alert.present();
          this.isNextFrm=false;
        }
      });

      //
    }else if(!isValidEmail){
      this.isNextFrm=false;
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Please enter valid email',
        buttons: ['Ok']
      });
      alert.present();
    }else{
      this.isNextFrm=false;
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Password and confirm password must match.',
        buttons: ['Ok']
      });
      alert.present();
    }
    
  }
}

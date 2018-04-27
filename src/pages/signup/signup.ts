import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, AlertController} from 'ionic-angular';
import { AuthServiceProvider } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';

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
    public translateService: TranslateService
  ) {
    this.form = fbuilder.group({
      'username': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      'cpassword': ['', Validators.compose([Validators.required])],
      //'address': ['']
    });

    this.username = this.form.controls['username'];
    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
    this.cpassword = this.form.controls['cpassword'];

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })
  }

  doSignup() {
    // Attempt to login in through our User service
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
  public onLogin() {
    this.navCtrl.push('LoginPage');
  }

  public gotoNextSignup(){
    this.isNextFrm=true;
  }
}

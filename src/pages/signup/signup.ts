import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, AlertController} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Device } from '@ionic-native/device';
import * as _ from 'lodash';

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
  public interestList = [];

  public InterestDropdownList = [];
  public selectedIntItems = [];
  public responseIntData: any;
  public searchQuery: string = '';

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
    this.getInterestList();
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
    let filterIntData = _.map(this.InterestDropdownList, function(item) {
        if (item.checked == true) return item;
    });
    filterIntData = _.without(filterIntData, undefined)
    if (this.form.valid && filterIntData.length >0) {
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
          if(filterIntData.length>0){
            filterIntData.forEach(element => {
              if(element.name!=''){
                let userInterestList={
                  "interest_text" : element.name,
                  "user_id" : this.responseData.id,
                  "interestId" : element.id
                };
                this.selectedIntItems.push(userInterestList);
              }
            });
            
            let custIntJData={"interested":this.selectedIntItems}
            this.userService.postData(custIntJData,'CustomerInterests/insertInterest').then((result) => {
             
            }, (err) => {
              
            });
          }
          
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
    }else{
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Please select your interest.',
        buttons: ['Ok']
      });
      alert.present();
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

  public getInterestList(){
    let filterUserData = '{"where":{"is_active":true}}';
    this.userService.getData('interests?filter=' + filterUserData).then((result) => {
      //console.log(result);
      this.responseIntData = result;
      if (this.responseIntData.length > 0) {
        this.responseIntData.forEach((color: { name: string, id: number, description: string }) => {
          this.InterestDropdownList.push({
            id: color.id,
            name: color.name,
            description: color.description,
            checked:false
          });
        });
        this.interestList = this.InterestDropdownList;
        //console.log(this.InterestDropdownList);
      }
    }, (err) => {
      let emailErrMsg= this.jsonErrMsg.messageData(err);
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: this.jsonErrMsg.messageData(err),
        buttons: ['Ok']
      });
      alert.present();
    });
  }

  public searchItems(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.InterestDropdownList=this.searchPipe(this.interestList, val);
      // this.items = this.items.filter((item) => {
      //   return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      // })
    }else{
      this.InterestDropdownList = this.interestList;
    }
  }

  public searchPipe(items, sdata){
    const /** @type {?} */ toCompare = sdata.toLowerCase();
    return items.filter(function (item) {
        for (let /** @type {?} */ property in item) {
          //console.log(item);
            if (item[property] === null) {
                continue;
            }
            if (item[property].toString().toLowerCase().includes(toCompare)) {
                return true;
            }
        }
        return false;
    });
}

}

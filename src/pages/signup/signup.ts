import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, AlertController, Platform} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Device } from '@ionic-native/device';
import * as _ from 'lodash';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder,  NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
//import { GoogleMapProvider } from '../../providers/google-map/google-map';

function duplicatePassword(input: FormControl) {
  if (!this.input.root || !this.input.root.controls) {
    return null;
  }

  const exactMatch = this.input.root.controls.password.value === this.input.value;
  return exactMatch ? null : { mismatchedPassword: true };
}
//declare let google:any;

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

  public selectLocation: boolean =true;
  public location: any = { lat:null, lng: null, name: null, formatted_address: null}; 
  public defaultLat:number;
  public defaultLng:number;
  public userSettings: any = {
    showSearchButton:false,
    inputPlaceholderText: 'Search for a place'
  };
  public locJsonData: any;
  public interestNameTest: string = '';
  public interestCustTestSel: boolean = false;
  public nearestLoc:string = '';

  constructor(public navCtrl: NavController,
    public userService: AuthServiceProvider,
    public toastCtrl: ToastController,
    private fbuilder: FormBuilder,
    public alertCtrl: AlertController,
    public translateService: TranslateService,
    public jsonErrMsg: ResponseMessage,
    //public maps: GoogleMapProvider,
    private geolocation: Geolocation,
    private platform: Platform,
    private _GEOCODE  : NativeGeocoder
    //private device: Device
  ) {
    this.form = fbuilder.group({
      'username': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required,Validators.email])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      'cpassword': ['', Validators.compose([Validators.required])],
      //'interested'     : fbuilder.array([ this.initInterestedFields() ])
      'interested'     : fbuilder.array([ ])
    });

    this.username = this.form.controls['username'];
    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
    this.cpassword = this.form.controls['cpassword'];

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })
    this.getInterestList();
    this.geolocation.getCurrentPosition().then(pos => {
      //console.log(pos.coords);
      //console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
      this.location.lat =  pos.coords.latitude;
      this.location.lng =  pos.coords.longitude;
      this.getGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
      //console.log(this.location);
    });
    
    // this.geolocation.getCurrentPosition().then(pos => {
    //   //console.log(pos.coords);
    //   //console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
    //   this.defaultLat =  pos.coords.latitude;
    //   this.defaultLng =  pos.coords.longitude;
    //   let addressUser=this.getGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
    //   console.log(addressUser);
    //   console.log(this.defaultLat);
    // });
    //console.log(this.defaultLat);
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
    //console.log(filterIntData);
    filterIntData = _.without(filterIntData, undefined);
    let userAddNewInt =this.form.controls['interested'].value;
    if (this.form.valid && (filterIntData.length >0 || this.interestNameTest!='')) {
      
      if(this.location.lat && this.location.lat!=''){

      }else{
        this.location.lat = this.defaultLat;
      }

      if(this.location.lng && this.location.lng!=''){

      }else{
        this.location.lng = this.defaultLng;
      }

      if(this.location.formatted_address && this.location.formatted_address!=''){

      }else{
        this.location.formatted_address = '';
      }

      let signupJsonData={
        "name": this.username.value.toString(),
        //"username": this.username.value.toString(),
        "email": this.email.value.toString(),
        "password": this.password.value.toString(),
        "interested":this.form.controls['interested'].value,
        "is_active": true,
        "location": this.location.formatted_address,
        "lat": this.location.lat,
        "lng": this.location.lng,
        "emailVerified": true,
        //"deviceToken": this.device.uuid,
        //"deviceType": this.device.platform
      };
      //console.log(filterIntData);
      //console.log(this.interestNameTest);
      this.userService.postData(signupJsonData,'Customers').then((result) => {
        //console.log(result);
        this.responseData = result;
        if(this.responseData.id){
          let userId=this.responseData.id;
          // if(userAddNewInt.length >0){
          //   userAddNewInt.forEach(element => {
          //     let userInputIntName = element.name;
          //     if(userInputIntName!=''){
          //       this.createUserInterest(userInputIntName, userId);
          //     }
          //   });
          // }

          if(this.interestNameTest != '' && this.interestCustTestSel){
            this.createUserInterest(this.interestNameTest, userId);
          }
          
          if(filterIntData.length>0){
            filterIntData.forEach(element => {
              if(element.name!=''){
                let userInterestList={
                  "interest_text" : element.name,
                  "user_id" : this.responseData.id,
                  "interestId" : element.id
                };
                this.selectedIntItems.push(userInterestList);
                
                // insert data into node module
                //if(){
                  let getNodeList='{"where":{"interestId":'+element.id+'}, "include":["nodedet"]}';
                  this.userService.getData('NodeInterests?filter=' + getNodeList).then((result:any) => {
                    if(result.length > 0){
                      this.addUserToCommunityNode(result, userId);
                    }
                    //console.log(result);
                  
                  }, (err) => {
                    
                  });
                //}
              }
            });
            //console.log(this.selectedIntItems);
            let custIntJData={"interested":this.selectedIntItems}
            this.userService.postData(custIntJData,'CustomerInterests/insertInterestNoDelPre').then((result) => {
             
            }, (err) => {
              
            });
          }
          // if(this.selectedIntItems.length>0){ 
            
          // }
          
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

  addUserToCommunityNode(nodeList:any, LastUserId){
    let customerNodeList = [];
    let customerLat = Number(this.location.lat);
    let customerLng = Number(this.location.lng);
    //console.log(customerLat);
    nodeList.forEach(element => {
      if(element.nodedet.latitude!='' && element.nodedet.longitude!=''){
        let distance = this.calcCrow(customerLat, customerLng, Number(element.nodedet.latitude), Number(element.nodedet.longitude));
        if (distance < 1) {
          let data1 = { cDate: new Date(), customerId: LastUserId, node_id: element.node_id, community_id: element.nodedet.community_id }
          customerNodeList.push(data1);
        }
      }
    });

    if(customerNodeList.length > 0){
        let custNodeJData = { "selectedNodes": customerNodeList, customerId: LastUserId};
        this.userService.postData(custNodeJData,'NodeUsers/addUserNodes').then((result) => {
          
        }, (err) => {
          
        });
    }
  }


  calcCrow(lat1, lon1, lat2, lon2) {
      let R = 6371; // km
      let dLat = this.toRad(lat2 - lat1);
      let dLon = this.toRad(lon2 - lon1);
      let latitude1 = this.toRad(lat1);
      let latitude2 = this.toRad(lat2);

      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(latitude1) * Math.cos(latitude2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      return d;
  }

  toRad(Value) {
    return Value * Math.PI / 180;
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
    if(password==cpassword && isValidEmail && this.selectLocation){
      this.userService.postData({"email":CheckvalidEmail},'Customers/emailChecking').then((result) => {
        this.responseData=result;
        //console.log( this.responseData);
        let emailErrMsg= this.responseData.response.message;
        if(emailErrMsg=='Email does not exist'){
          this.isNextFrm=true;
        }else{
          let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: emailErrMsg,
            buttons: ['Ok']
          });
          alert.present();
          this.isNextFrm=false;
        }
        // let alert = this.alertCtrl.create({
        //   title: 'Error!',
        //   subTitle: this.responseData.response.message,
        //   buttons: ['Ok']
        // });
        // alert.present();
        // this.isNextFrm=false;
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
    }else if(!this.selectLocation){
      let alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: 'Please enter your place.',
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
    let filterUserData = '{"where":{"is_active":true, "or":[{"is_hidden":0},{"is_hidden":null}]}}';
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

  public AddCustInt(){
    this.interestCustTestSel = true;
    this.InterestDropdownList = this.interestList;
  }

  public DeleteCustInt(){
    this.interestCustTestSel = false;
    this.InterestDropdownList = this.interestList;
    this.interestNameTest='';
  }
  public searchItems(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      let trimVal =val.trim();
      this.interestNameTest= trimVal;
      this.InterestDropdownList=this.searchPipe(this.interestList, trimVal);
      // this.items = this.items.filter((item) => {
      //   return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      // })
    }else{
      this.InterestDropdownList = this.interestList;
      this.interestNameTest='';
    }
    //console.log(this.interestNameTest);
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

  public createUserInterest(IntName, userId){
    let selectedUser:Array<any> = [];
    selectedUser.push(userId);
    let IntjsonData = {"name":IntName,"is_pid":0, "description":"", "is_active":true, "user_id":userId};
    this.userService.postData(IntjsonData,'interests').then((result:any) => {
      let IntId = result.id;
      if(IntId!=''){
        // push data into customer interest list
        let selectedNewIntItems = [];
        let userInterestList={
          "interest_text" : IntName,
          "user_id" : userId,
          "interestId" : IntId
        };

        selectedNewIntItems.push(userInterestList);

        if(selectedNewIntItems.length>0){ 
          let custIntJData={"interested":selectedNewIntItems}
          this.userService.postData(custIntJData,'CustomerInterests/insertInterestNoDelPre').then((result) => {
           
          }, (err) => {
            
          });
        }

        let communityName= IntName+' Community';
        let community = {is_active:true, name:communityName, description:"", location:this.location.formatted_address, latitude:this.location.lat, longitude:this.location.lng, community_type: 2, created_at:new Date()};

        this.userService.postData(community,'communities').then((result:any) => {
          let lastCommunityId=result.id;
          
          // add community interest
          let selectInterest = [];
          selectInterest.push(IntId);
          let ComIntjsonData = {"community_id":lastCommunityId,"selectinterest":selectInterest};
          this.userService.postData(ComIntjsonData,'CommunityInterests/insertData').then((result:any) => {
            
          }, (err) => {
        
          }); 

          // add community user
          let UsrjsonData = {"community_id":lastCommunityId,"selectuser":selectedUser};
          this.userService.postData(UsrjsonData,'CommunityUsers/insertData').then((result:any) => {
            
          }, (err) => {
        
          }); 

          this.createNode(lastCommunityId, community, IntId, userId);
        }, (err) => {
      
        });  
      }
    }, (err) => {
      
    });
  }

  public createNode(comId:number, community:any, selInterest:any, selectUser){
    let nodeId:any = null;
    let nodeName = community.name;
    let selectedUser:Array<any> = [];
    if(selInterest>0){
      nodeName = nodeName+' - '+this.nearestLoc;

      // create new node respect to community
      let nodeCreateJson = {name: nodeName, description: community.description, location: community.location, type: community.community_type, latitude: community.latitude, longitude: community.longitude, is_active:1, created_at:new Date(),community_id:comId};
      
      this.userService.postData(nodeCreateJson,'community_nodes').then((result:any) => {
        nodeId = result.id;
        if(nodeId!=''){
          
          // add node interest
          let selectInterest = [];
          selectInterest.push(selInterest);
          let IntjsonData = {"node_id":nodeId,"selectinterest":selectInterest};
          this.userService.postData(IntjsonData,'NodeInterests/insertData').then((result:any) => {
            
          }, (err) => {
        
          }); 
          
          // add node user
          let data1 = { cDate: new Date(), customerId: selectUser, node_id: nodeId, community_id: comId };
          selectedUser.push(data1);
          let UsrjsonData = { "selectuser": selectedUser, node_id: nodeId, community_id:comId};
          
          this.userService.postData(UsrjsonData,'NodeUsers/insertData').then((result:any) => {
          }, (err) => {
          }); 

        }
      }, (err) => {
        
      });
    }  
  }

  public autoCompleteCallback1(selectedData: any) {
    this.selectLocation = true;
    this.locJsonData = JSON.parse(JSON.stringify(selectedData));
    this.location.formatted_address = this.locJsonData.data.formatted_address;
    this.location.name = this.locJsonData.data.formatted_address;
    this.location.lat = this.locJsonData.data.geometry.location.lat;
    this.location.lng = this.locJsonData.data.geometry.location.lng;
    //console.log(this.location);
  }

  //public getGeocodeLocation(lat : number, lng : number): Promise<any>{
  public getGeocodeLocation(lat : number, lng : number){  
    //console.log(lat);
    this._GEOCODE.reverseGeocode(lat, lng).then((result:NativeGeocoderReverseResult) => {
        JSON.stringify(result);
        let str : string   = '';
        if(result[0].thoroughfare){
          str= str+ result[0].thoroughfare +', ';
        }
        if(result[0].locality){
          str= str+ result[0].locality +', ';
          this.nearestLoc = result[0].locality;
        }
        if(result[0].subAdministrativeArea){
          str= str+ result[0].subAdministrativeArea +', ';
        }
        if(result[0].administrativeArea){
          str= str+ result[0].administrativeArea +', ';
        }
        if(result[0].countryName){
          str= str+ result[0].countryName;
        }
        //resolve(str);
        this.location.formatted_address = str;
        this.location.name = str;
        
    //console.log(JSON.stringify(result))

  }).catch((error: any) => console.log(error));

   }

}

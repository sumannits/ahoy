import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, ActionSheetController, Platform, LoadingController, Loading} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import * as _ from 'lodash';
/**
 * Generated class for the EditprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})
export class EditprofilePage {

  loading: Loading;
  private form: FormGroup;
  private responseData: any;
  private responseDataAny: any;
  public userData:any;
  public interestList = [];
  public InterestDropdownList = [];
  public mySelectedIntList = [];
  public mySelectedIntNameList:any;
  public selectedIntItems = [];
  public responseIntData: any;
  public addNewInt:boolean = false;
  //public imageURI:any;
  //public imageFileName:any;
  //public currentName:any;
  public lastImage: string = null;

  public selectLocation: boolean =false;
  public location: any = { lat:null, lng: null, name: null, formatted_address: null}; 
  //public defaultLat:number;
  //public defaultLng:number;
  public userSettings: any = {
    showSearchButton:false,
    inputPlaceholderText: 'Search for a place'
  };
  public locJsonData: any;
  public preSelectedIntItems = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: AuthServiceProvider,
    public toastCtrl: ToastController,
    private fbuilder: FormBuilder,
    public alertCtrl: AlertController,
    public jsonErrMsg: ResponseMessage,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private transfer: FileTransfer,
    private file: File, 
    private filePath: FilePath,
    public platform: Platform,
    public loadingCtrl: LoadingController
  ) {
    // this.form = this.fbuilder.group({
    //   name: ['', Validators.required],
    //   phone: ['', Validators.pattern('[0-9]{10}')]
    // });
    const loguserDet = JSON.parse(localStorage.getItem('userPrfDet'));
    //console.log(loguserDet);
    this.userData=loguserDet;

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
      image: new FormControl(''),
      location: new FormControl(''),
      lat: new FormControl(''),
      email: new FormControl(''),
      lng: new FormControl(''),
      bio: new FormControl(''),
      interested: fbuilder.array([ ])
    });
    
  }

  ionViewDidLoad() {
    
    this.getMyInterestList();
    this.getInterestList();
  }

  getMyInterestList() {
    this.form.controls['location'].setValue(this.userData.location);
    this.form.controls['lat'].setValue(this.userData.lat);
    this.form.controls['lng'].setValue(this.userData.lng);
    this.form.controls['name'].setValue(this.userData.name);
    this.form.controls['email'].setValue(this.userData.email);
    this.form.controls['phone'].setValue(this.userData.phone);
    this.form.controls['bio'].setValue(this.userData.bio);

    if(this.userData.location!=''){
      this.userSettings['inputString']=this.userData.location;
      this.userSettings = Object.assign({},this.userSettings);
      this.selectLocation = true;
    }
    
    //let filterIntData={"user_id": this.userData.id};
    let filterIntData = '{"where":{"user_id":'+this.userData.id+'}}';
    this.userService.getData('CustomerInterests?filter='+filterIntData).then((result) => {
      this.responseDataAny=result;
      this.mySelectedIntNameList = result;
      //console.log(result);
      if(this.responseDataAny.length>0){
        this.responseDataAny.forEach(element => {
          if(element.interestId!=''){
            this.mySelectedIntList.push(element.interestId);
            // this.preSelectedIntItems.push({
            //   "name" : element.interest_text,
            //   //"user_id" : this.userData.id,
            //   "id" : element.interestId
            // });
          }
        });
      }
    }, (err) => {
      // let alert = this.alertCtrl.create({
      //   title: 'Error!',
      //   subTitle: this.jsonErrMsg.messageData(err),
      //   buttons: ['Ok']
      // });
      // alert.present();
    });

    
    //console.log('ionViewDidLoad EditprofilePage');
  }

  initInterestedFields() : FormGroup{
    let userId= this.userData.id;
    return this.fbuilder.group({
      interest_text : [''],
      user_id : [userId],
      interest_id : ['']
        //name : ['', Validators.required]
    });
  }

  initEditIntFields(element:any) : FormGroup{
    return this.fbuilder.group({
      interest_text : [element.interest_text],
      user_id : [element.user_id],
      interest_id : [element.interest_id]
    });
  }

  editIntInputField(element:any) : void{
    const control = <FormArray>this.form.controls.interested;
    control.push(this.initEditIntFields(element));
  }

  addNewInputField() : void{
    // const control = <FormArray>this.form.controls.interested;
    // control.push(this.initInterestedFields());
    this.addNewInt = !this.addNewInt;
  }

  removeInputField(i : number) : void{
    const control = <FormArray>this.form.controls.interested;
    control.removeAt(i);
  }

  updateDetails(data:any){
    let filterIntData = _.map(this.InterestDropdownList, function(item) {
        if (item.checked == true) return item;
    });
    filterIntData = _.without(filterIntData, undefined)

    if(this.form.valid){
      this.lastImage = '';
      if(this.lastImage!=''){
        data.image=this.lastImage;
      }else{
        delete data.image;
      }
      this.userService.patchData(data,'Customers/'+this.userData.id).then((result) => {
        //console.log(result);
        this.responseData = result;
        if(this.responseData.id){
          localStorage.setItem('userPrfDet', JSON.stringify(result));
          this.presentToast('Data updated successfully.');

          //console.log(filterIntData);
          if(filterIntData.length>0){
            filterIntData.forEach(element => {
              if(element.name!=''){
                let userInterestList={
                  "interest_text" : element.name,
                  "user_id" : this.userData.id,
                  "interestId" : element.id
                };
                this.selectedIntItems.push(userInterestList);

                // insert data into node module
                //if(){
                  let getNodeList='{"where":{"interestId":'+element.id+'}, "include":["nodedet"]}';
                  this.userService.getData('NodeInterests?filter=' + getNodeList).then((result:any) => {
                    if(result.length > 0){
                      this.addUserToCommunityNode(result);
                    }
                    //console.log(result);
                  
                  }, (err) => {
                    
                  });
                //}
                }
            });
            
            let custIntJData={"interested":this.selectedIntItems}
            this.userService.postData(custIntJData,'CustomerInterests/insertInterest').then((result) => {
             
            }, (err) => {
              
            });
          }

          // if(data.interested.length>0){
          //   let custIntJData={"interested":data.interested}
          //   this.userService.postData(custIntJData,'CustomerInterests/insertInterest').then((result) => {
             
          //   }, (err) => {
              
          //   });
          // }
          
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
      this.presentToast('Error something wrong. Please try after sometime.');
    }
    this.lastImage ='';
    //console.log(data);
  }

  addUserToCommunityNode(nodeList:any){
    let customerNodeList = [];
    let customerLat = Number(this.form.controls['lat'].value);
    let customerLng = Number(this.form.controls['lng'].value);
    //console.log(customerLat);
    nodeList.forEach(element => {
      if(element.nodedet.latitude!='' && element.nodedet.longitude!=''){
        let distance = this.calcCrow(customerLat, customerLng, Number(element.nodedet.latitude), Number(element.nodedet.longitude));
        if (distance < 1) {
          let data1 = { cDate: new Date(), customerId: this.userData.id, node_id: element.node_id, community_id: element.nodedet.community_id }
          customerNodeList.push(data1);
        }
      }
    });

    if(customerNodeList.length > 0){
        let custNodeJData = { "selectedNodes": customerNodeList, customerId: this.userData.id};
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

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Take a picture',
          icon: 'camera',
          handler: () => {
            this.uploadFromCamera(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: 'From gallery',
          icon: 'images',
          handler: () => {
            this.uploadFromCamera(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }
      ]
    });
    actionSheet.present();
  }

  uploadFromCamera(sourceType){

    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
   
    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName(currentName));
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName(currentName));
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

  private copyFileToLocalDir(namePath, currentName, newFileName) {
    //console.log("CURRENTFILENAME",currentName);
     this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
       this.lastImage = newFileName;
       //console.log("NEWFILENAMEEEEEE",this.lastImage);
     }, error => {
        this.presentToast('Error while storing file.');
     });
  }

  private createFileName(currentName) {
    var d = new Date(),
    //n = d.getTime(),
   // newFileName=n+".jpg";
    newFileName=currentName;
    return newFileName;
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public uploadImage(id) {
    // Destination URL
    var url = "http://111.93.169.90/team6/poolrep/api/users/productimageinsert.json";
   
    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);
   
    // File name only
    var filename = this.lastImage;
   
    var options = {
      fileKey: "photo",
      photo: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params : {
      'photo':filename,
      'product_id':id
       }
     // params : {'fileName': filename}
    };
    const fileTransfer:FileTransferObject = this.transfer.create();
   
    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();
   
    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.loading.dismissAll()
      this.presentToast('Image succesful uploaded.');
      //this.navCtrl.push('HomePage');
    }, err => {
      //console.log("Error",err);
      this.loading.dismissAll()
      this.presentToast('Error while uploading file.');
    });
  }

  public getInterestList(){
    let filterUserData = '{"where":{"is_active":true}}';
    this.userService.getData('interests?filter=' + filterUserData).then((result) => {
      //console.log(this.mySelectedIntList);
      this.responseIntData = result;
      if (this.responseIntData.length > 0) {
        this.responseIntData.forEach((color: { name: string, id: number, description: string }) => {
          let checkInt = _.includes(this.mySelectedIntList, color.id);
          let checkedVal:boolean = false;
          if(checkInt){
            checkedVal= true;
          }
          //console.log(checkInt);
          this.InterestDropdownList.push({
            id: color.id,
            name: color.name,
            description: color.description,
            checked:checkedVal
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

  public autoCompleteCallback1(selectedData:any) {
    this.locJsonData=JSON.parse(JSON.stringify(selectedData));
    this.form.controls['location'].setValue(this.locJsonData.data.formatted_address);
    this.form.controls['lat'].setValue(this.locJsonData.data.geometry.location.lat);
    this.form.controls['lng'].setValue(this.locJsonData.data.geometry.location.lng);
    this.selectLocation = true;
  }
}

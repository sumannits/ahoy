import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, ActionSheetController, Platform, LoadingController, Loading} from 'ionic-angular';
import { AuthServiceProvider, ResponseMessage } from '../../providers';
import { FormControl, FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';

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
  public userData:any;

  //public imageURI:any;
  //public imageFileName:any;
  //public currentName:any;
  public lastImage: string = null;

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

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
      phone: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
      image: new FormControl('')
    });
    const loguserDet = JSON.parse(localStorage.getItem('userPrfDet'));
    //console.log(loguserDet);
    this.userData=loguserDet;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditprofilePage');
  }

  updateDetails(data:any){
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
          //this.navCtrl.setRoot('WelcomePage');
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

}

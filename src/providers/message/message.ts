import { Injectable } from '@angular/core';

@Injectable()
export class ResponseMessage {
    public errMsg:string='';
    public errMsgbody:any;

    constructor() {
    }

    public messageData(errorJson:any){
        //let jsonStr=JSON.stringify(errorJson);
        this.errMsg='';
        if(errorJson.status == 401 || errorJson.status == 422 || errorJson.status == 500){
            if(errorJson._body){
                this.errMsgbody= JSON.parse(errorJson._body);
                if(this.errMsgbody.error.message){
                    this.errMsg=this.errMsgbody.error.message;
                }
            }
        }
        //console.log(errorJson);
        return this.errMsg;
    }
}
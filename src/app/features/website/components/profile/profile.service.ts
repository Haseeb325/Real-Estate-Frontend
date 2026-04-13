import { Injectable } from "@angular/core";
import { AdvanceCrudService } from "../../../../shared/advance.crud.service";
import { BuyerProfile } from "../../../../core/models/buyer.model";
import { BuyerProfileDto } from "../../../../core/models/buyer.dto";
import { URLConfig } from "../../../../shared/utils/url-config";

@Injectable({
    providedIn:'root'
})

export class ProfileService extends AdvanceCrudService<BuyerProfile,BuyerProfileDto>{

   readonly profileData = this.singleFetchedItem.asReadonly()
//    getProfile(){
//     return this.fetch(URLConfig.buyerProfile)
//    }

async getProfile(){
  return await this.fetch(URLConfig.buyerProfile)
   }

}
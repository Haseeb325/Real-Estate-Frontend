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

constructor() {
    super();
    // CRITICAL: This is the missing link!
    this.mapFromDto = (dto: BuyerProfileDto) => BuyerProfile.fromJson(dto);
  }

async getProfile(){
  return await this.fetch(URLConfig.buyerProfile)
   }


   updateProfile(options: { url?: string, payload: Partial<BuyerProfile> | FormData, isFormData?: boolean, autoRefresh?: boolean, autoRefreshUrl?: string, updateState?: boolean, useGlobalLoading?: boolean }) {
    return this.update({ url: URLConfig.buyerProfile, ...options });
   }




}
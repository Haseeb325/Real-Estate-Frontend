import { Injectable , Signal, computed } from "@angular/core";
import { BaseCrudService } from "../../shared/base.crud.service";
import {URLConfig} from "../../shared/utils/url-config"
import {Property, PropertyDetails} from "../../core/interfaces/property";
import { PropertyDetail } from "./property-detail/property-detail";

@Injectable({
    providedIn:'root'
})


export class WebSiteService extends BaseCrudService <Property> {

    propertiesData = computed(() => this.data())
    
  
   selectedProperty: Signal<PropertyDetails | null> = this.selectedItem.asReadonly()
//     selectedSubDetail = computed<PropertyDetails | null>(()=>{
//    const property = this.selectedItem()
//    if(property){
//     switch(property.property_type){
//       case 'house':
//         return property?.house
//       case 'commercial':
//         return property?.commercial
//       case 'apartment':
//         return property?.apartment
//       case 'plots_and_land':
//           return property?.plots_and_land
//           default:
//               return null
//     }
//    }

// //    2nd method of lookup
// //    const detailMap: Record<string, any> = {
// //             'house': property.house,
// //             'commercial': property.commercial,
// //             'apartment': property.apartment,
// //             'plots_and_land': property.plots_and_land
// //         };

// //         return detailMap[property.property_type] || null;

//    })

   
    isLoading = computed(() => this.loading())
    
    fetchProperties(params: any, append = false, forceRefresh = false) {
        return this.fetch(this.apiService.getWithParams(URLConfig.getAllProperties, params), forceRefresh, append)
    }

    fetchPropertyById(id:any){
        return this.fetchById(id, 'id', this.apiService.get(URLConfig.getSpecificProperty(id)))
    }

}
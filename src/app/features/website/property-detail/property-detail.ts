import { Component, computed, inject, Signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute} from '@angular/router';
import { WebSiteService } from '../website.service';
import { getCloudinaryUrl } from '../../../shared/utils/common-utils';
import { Shared } from '../../../shared/shared.module';
import { CommercialDetail } from '../components/commercial-detail/commercial-detail';
import { PlotAndLandDetail } from '../components/plot-and-land-detail/plot-and-land-detail';
import { ApartmentDetail } from '../components/apartment-detail/apartment-detail';
import { HouseDetail } from '../components/house-detail/house-detail';

@Component({
  selector: 'app-property-detail',
  imports: [Shared, CommercialDetail, PlotAndLandDetail, ApartmentDetail, HouseDetail],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss',
})
export class PropertyDetail {
   location = inject(Location)
   route = inject(ActivatedRoute)
   websiteService = inject(WebSiteService)
   property = this.websiteService.selectedProperty
  // propertySubDetail = this.websiteService.selectedSubDetail
  getCloudinaryUrl = getCloudinaryUrl
  purchaseType = 'Buy'

   ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id')
    console.log(id)
    this.websiteService.fetchPropertyById(id)?.subscribe((res:any)=>{
        // console.log(res)
    
    })
    
   }

   splitLastZero(str:any){
    return str.split('.')[0]
   }


}

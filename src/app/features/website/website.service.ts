import { Injectable , computed } from "@angular/core";
import { BaseCrudService } from "../../shared/base.crud.service";
import {URLConfig} from "../../shared/utils/url-config"
import {Property} from "../../core/interfaces/property";

@Injectable({
    providedIn:'root'
})


export class WebSiteService extends BaseCrudService <Property> {

    propertiesData = computed(() => this.data())
    selectedProperty = computed(() => this.selectedItem())
    isLoading = computed(() => this.loading())
    
    fetchProperties(params: any, append = false, forceRefresh = false) {
        return this.fetch(this.apiService.getWithParams(URLConfig.getAllProperties, params), forceRefresh, append)
    }

}
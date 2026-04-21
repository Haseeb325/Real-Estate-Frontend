import { inject, Injectable } from '@angular/core';
import { AdvanceCrudService } from '../../../shared/advance.crud.service';
import { PropertyDetails } from '../../../core/interfaces/property';
import { URLConfig } from '../../../shared/utils/url-config';

@Injectable({
  providedIn: 'root',
})
export class PropertyService extends AdvanceCrudService<PropertyDetails, any> {
  getPropertyById(id: any) {
    return this.fetchById(URLConfig.getSellerSpecificProperty(id), id);
  }

  createProperty(body: {
    payload: any;
    isFormData?: boolean;
    autoRefresh?: boolean;
    autoRefreshUrl?: string;
    updateState?: boolean;
    useGlobalLoading?: boolean;
  }) {
    return this.create({ url: URLConfig.createProperty, ...body });
  }

  updateProperty(id: any, body: { payload: any; isFormData?: boolean }) {
    return this.update({
      url: URLConfig.getSellerSpecificProperty(id),
      ...body,
    });
  }
}

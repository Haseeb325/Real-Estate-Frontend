import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from '../../../shared/base.crud.service';
import { URLConfig } from '../../../shared/utils/url-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseCrudService<any> {
  getAllProperties(params: any, forceRefresh = false) {
    return this.fetch(
      this.apiService.getWithParams(URLConfig.getAllSellerProperties, params),
      forceRefresh
    );
  }
}

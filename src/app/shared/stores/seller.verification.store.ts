import { signalStore, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { withCrudEntities } from '../signals/crud.feature';
import { sellerProfile } from '../../core/interfaces/seller';
import { URLConfig } from '../utils/url-config';
import { ApiService } from '../api.service';
import { firstValueFrom } from 'rxjs';

export const SellerVerificationStore = signalStore(
  { providedIn: 'root' },
  withCrudEntities<sellerProfile>({
    entityName: 'seller',
  }),
  withMethods((store, apiService = inject(ApiService)) => ({
    async loadPendingSellers(params: any = {}, forceRefresh = false) {
      return store.loadAll(URLConfig.getAdminSellerVerifications(), params, forceRefresh);
    },

    async approveSeller(id: string | number) {
      return store.runRequest(async () => {
        const url = `${URLConfig.getAdminSellerVerifications()}${id}/approve/`;
        await firstValueFrom(apiService.post(url, {}));
        // Remove from list or update state
        store.loadAll(URLConfig.getAdminSellerVerifications());
      });
    },

    async rejectSeller(id: string | number) {
      return store.runRequest(async () => {
        const url = `${URLConfig.getAdminSellerVerifications()}${id}/reject/`;
        await firstValueFrom(apiService.post(url, {}));
        store.loadAll(URLConfig.getAdminSellerVerifications());
      });
    },
  })),
);

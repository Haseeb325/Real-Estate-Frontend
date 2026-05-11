import { signalStore, withMethods, patchState } from '@ngrx/signals';
import { withCrudEntities } from '../signals/crud.feature';
import { PropertyDetails } from '../../core/interfaces/property';
import { URLConfig } from '../utils/url-config';
import { ApiService } from '../api.service';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';

export const ListingVerificationStore = signalStore(
  { providedIn: 'root' },
  withCrudEntities<PropertyDetails>({
    entityName: 'pendingProperty',
  }),
  withMethods((store, apiService = inject(ApiService)) => ({
    async loadPendingProperties(params: any = {}, forceRefresh = false) {
      return store.loadAll(
        URLConfig.getPendingPropertiesVerifications(),
        {
          ...params,
          status: 'pending',
        },
        forceRefresh,
      );
    },

    async verifyProperty(id: string | number) {
      return store.runRequest(async () => {
        await firstValueFrom(apiService.post(URLConfig.verifyProperty(id), {}));
        // Refresh list to remove the verified item
        this.loadPendingProperties();
      });
    },

    async rejectProperty(id: string | number) {
      return store.runRequest(async () => {
        await firstValueFrom(apiService.post(URLConfig.rejectPropertyVerification(id), {}));
        // Refresh list
        this.loadPendingProperties();
      });
    },
  })),
);

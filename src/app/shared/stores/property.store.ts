import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { withCrudEntities } from '../signals/crud.feature';
import { PropertyDetails } from '../../core/interfaces/property';
import { URLConfig } from '../utils/url-config';
import { inject } from '@angular/core';
import { ApiService } from '../api.service';
import { firstValueFrom } from 'rxjs';
import { setEntity } from '@ngrx/signals/entities';

export const AdminPropertyStore = signalStore(
  { providedIn: 'root' },
  withCrudEntities<PropertyDetails>({
    entityName: 'property',
    cacheTtl: 30000,
  }),
  withMethods((store) => {
    const apiService = inject(ApiService);
    return {
      fetchProperties(params: any = {}, forceRefresh = false) {
        store.fetch(URLConfig.getAllPropertiesByAdmin, params, forceRefresh);
      },

      async getPropertyDetails(id: string | number) {
        return store.loadById(id, URLConfig.getSpecificPropertyByAdmin(id), true);
      },

      selectProperty(id: string | number | null) {
        store.setSelectedId(id);
      },

      async inactivateProperty(id: string | number) {
        return store.runRequest(async () => {
          await firstValueFrom(apiService.post(URLConfig.inactivePropertyByAdmin(id), {}));
          const updatedProperty = (store.entityMap() as any)[id];
          if (updatedProperty) {
            patchState(store, setEntity({ ...updatedProperty, status: 'inactive' }));
          }
        });
      },

      async activateProperty(id: number | string) {
        return store.runRequest(async () => {
          await firstValueFrom(apiService.post(URLConfig.reactivatePropertyByAdmin(id), {}));
          const updatedProperty = (store.entityMap() as any)[id];
          if (updatedProperty) {
            patchState(store, setEntity({ ...updatedProperty, status: 'active' }));
          }
        });
      },
    };
  }),
);

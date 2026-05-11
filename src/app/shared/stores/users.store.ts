import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setEntity } from '@ngrx/signals/entities';
import { withCrudEntities } from '../signals/crud.feature';
import { UserModel } from '../../core/models/User';
import { URLConfig } from '../utils/url-config';
import { inject } from '@angular/core';
import { ApiService } from '../api.service';
import { firstValueFrom } from 'rxjs';

export const UserStore = signalStore(
  { providedIn: 'root' },
  withCrudEntities<UserModel>({
    entityName: 'Users',
    cacheTtl: 1000 * 60 * 30,
    mapFromDto: UserModel.fromJson,
  }),

  withMethods((store) => {
    const apiService = inject(ApiService);

    return {
      fetchUsers(params: any = {}, forceRefresh = false) {
        store.fetch(URLConfig.getAllUsers, params, forceRefresh);
      },

      async suspendUser(id: string) {
        return store.runRequest(async () => {
          await firstValueFrom(apiService.post(URLConfig.suspendUser(id), {}));
          const user = (store.entityMap() as any)[id];
          if (user) {
            const updatedUser = UserModel.fromJson({ ...user.toJson(), status: 'suspended' });
            patchState(store, setEntity(updatedUser));
          }
        });
      },

      async activateUser(id: string) {
        return store.runRequest(async () => {
          await firstValueFrom(apiService.post(URLConfig.activateUser(id), {}));
          const user = (store.entityMap() as any)[id];
          if (user) {
            const updatedUser = UserModel.fromJson({ ...user.toJson(), status: 'active' });
            patchState(store, setEntity(updatedUser));
          }
        });
      },
    };
  }),
);

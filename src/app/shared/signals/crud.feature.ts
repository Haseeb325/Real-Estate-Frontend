import { inject } from '@angular/core';
import {
  signalStoreFeature,
  withMethods,
  withState,
  patchState,
  withComputed,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  setEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom, pipe, switchMap, tap } from 'rxjs';
import { ApiService } from '../api.service';
import { withRequestStatus } from './request-status.feature';
import { ToastService } from '../../core/services/toast.service';

export interface CrudConfig<TModel, TDto> {
  entityName: string; // for logging or identifying
  cacheTtl?: number;
  mapFromDto?: (dto: TDto) => TModel;
  mapToDto?: (model: TModel) => TDto;
  defaultSort?: (a: TModel, b: TModel) => number;
}

export function withCrudEntities<TModel extends { id: string | number }, TDto = any>(
  config: CrudConfig<TModel, TDto>,
) {
  return signalStoreFeature(
    withEntities<TModel>(),
    withRequestStatus(),
    withState({
      lastFetched: null as number | null,
      selectedId: null as string | number | null,
      singleFetchedItem: null as TModel | null,
      totalCount: 0,
    }),
    withComputed((store) => ({
      isCacheValid: () => {
        const last = store.lastFetched();
        const ttl = config.cacheTtl ?? 30000;
        return !!last && Date.now() - last < ttl;
      },
      selectedEntity: () => {
        const id = store.selectedId();
        return id ? (store.entityMap() as any)[id] : null;
      },
    })),
    withMethods((store) => {
      const apiService = inject(ApiService);
      const toast = inject(ToastService);

      const mapFromDto = config.mapFromDto ?? ((dto: any) => dto as TModel);
      const mapToDto = config.mapToDto ?? ((model: any) => model as TDto);

      const applySort = (items: TModel[]) => {
        if (config.defaultSort) {
          return [...items].sort(config.defaultSort);
        }
        return items;
      };

      const searchProperties = rxMethod<{
        url: string;
        query?: string;
        search?: string;
        forceRefresh?: boolean;
        [key: string]: any;
      }>(
        pipe(
          distinctUntilChanged((prev, curr) => {
            if (curr.forceRefresh) return false;
            return JSON.stringify(prev) === JSON.stringify(curr);
          }),
          tap(() => patchState(store, { requestStatus: 'loading' })),
          switchMap(({ url, forceRefresh, ...params }) =>
            apiService.getWithParams<TDto>(url, params).pipe(
              tap({
                next: (response: any) => {
                  let dataArray: any[] = [];
                  let totalCount = 0;

                  if (response && Array.isArray(response.data)) {
                    dataArray = response.data;
                    totalCount = response.count ?? response.total ?? dataArray.length;
                  } else if (response && Array.isArray(response.results)) {
                    dataArray = response.results;
                    totalCount = response.count ?? response.total ?? dataArray.length;
                  } else if (Array.isArray(response)) {
                    dataArray = response;
                    totalCount = response.length;
                  } else if (response && response.data) {
                    dataArray = [response.data];
                    totalCount = 1;
                  } else if (response) {
                    dataArray = [response];
                    totalCount = 1;
                  }

                  const isSingle =
                    !Array.isArray(response) && response && !response.data && !response.results;
                  const singleItem = isSingle ? mapFromDto(response) : null;

                  let items = dataArray.map(mapFromDto);
                  items = applySort(items);

                  patchState(store, setAllEntities(items), {
                    lastFetched: Date.now(),
                    requestStatus: 'success',
                    singleFetchedItem: singleItem,
                    totalCount,
                  });
                },
                error: (err) => store.setError(err),
              }),
            ),
          ),
        ),
      );

      async function loadAll(
        url: string,
        params: any = {},
        forceRefresh = false,
        useGlobalLoading = false,
      ) {
        if (!forceRefresh && store.isCacheValid()) return;

        return store.runRequest(
          async () => {
            const response: any = await firstValueFrom(apiService.getWithParams<TDto>(url, params));

            let dataArray: any[] = [];
            let totalCount = 0;

            if (response && Array.isArray(response.data)) {
              dataArray = response.data;
              totalCount = response.count ?? response.total ?? dataArray.length;
            } else if (response && Array.isArray(response.results)) {
              dataArray = response.results;
              totalCount = response.count ?? response.total ?? dataArray.length;
            } else if (Array.isArray(response)) {
              dataArray = response;
              totalCount = response.length;
            } else if (response && response.data) {
              dataArray = [response.data];
              totalCount = 1;
            } else if (response) {
              dataArray = [response];
              totalCount = 1;
            }

            const isSingle =
              !Array.isArray(response) && response && !response.data && !response.results;
            const singleItem = isSingle ? mapFromDto(response) : null;

            let items = dataArray.map(mapFromDto);
            items = applySort(items);

            patchState(store, setAllEntities(items), {
              lastFetched: Date.now(),
              singleFetchedItem: singleItem,
              totalCount,
            });
            return items;
          },
          { useGlobalLoading },
        );
      }

      return {
        searchProperties,
        loadAll,

        fetch(url: string, params: any = {}, forceRefresh = false, useGlobalLoading = false) {
          const hasParams = Object.keys(params).length > 0;
          if (hasParams || forceRefresh) {
            searchProperties({ url, ...params, forceRefresh });
          } else {
            loadAll(url, params, forceRefresh, useGlobalLoading);
          }
        },

        async loadById(id: string | number, url: string, useGlobalLoading = false) {
          const existing = (store.entityMap() as any)[id];
          const isFullDetailLoaded = store.singleFetchedItem()?.id === id;

          // If we have the data AND we've already fetched the full detail version before, skip the API call
          if (existing && isFullDetailLoaded) {
            patchState(store, { selectedId: id });
            return existing;
          }

          // Otherwise, we either don't have it or only have the partial "list" version, so fetch it
          if (existing) {
            patchState(store, { selectedId: id, singleFetchedItem: existing });
          } else {
            patchState(store, { selectedId: id });
          }

          return store.runRequest(
            async () => {
              const response: any = await firstValueFrom(apiService.get(url));
              const rawData = response.data || response;
              const item = mapFromDto(rawData);

              patchState(store, setEntity(item), {
                singleFetchedItem: item,
                selectedId: id,
              });
              return item;
            },
            { useGlobalLoading },
          );
        },

        async create(url: string, payload: Partial<TModel> | FormData, useGlobalLoading = false) {
          return store.runRequest(
            async () => {
              const finalBody = payload instanceof FormData ? payload : mapToDto(payload as TModel);
              const response: any = await firstValueFrom(apiService.post(url, finalBody));

              const rawData = response.data || response;
              const item = mapFromDto(rawData);

              patchState(store, addEntity(item));

              toast.success(response.message || response.data?.message || 'Created successfully');
              return item;
            },
            { useGlobalLoading },
          );
        },

        async update(
          id: string | number,
          url: string,
          payload: Partial<TModel> | FormData,
          useGlobalLoading = false,
        ) {
          return store.runRequest(
            async () => {
              const finalBody = payload instanceof FormData ? payload : mapToDto(payload as TModel);
              const response: any = await firstValueFrom(apiService.patch(url, finalBody));

              const rawData = response.data || response;
              const item = mapFromDto(rawData);

              patchState(store, updateEntity({ id, changes: item as any }));

              toast.success(response.message || response.data?.message || 'Updated successfully');
              return item;
            },
            { useGlobalLoading },
          );
        },

        async delete(id: string | number, url: string, useGlobalLoading = false) {
          return store.runRequest(
            async () => {
              const response: any = await firstValueFrom(apiService.delete(url));

              patchState(store, removeEntity(id));
              if (store.selectedId() === id) {
                patchState(store, { selectedId: null });
              }
              toast.success(response.message || response.data?.message || 'Deleted successfully');
              return response.data;
            },
            { useGlobalLoading },
          );
        },

        clearCache() {
          patchState(store, { lastFetched: null });
        },

        setSelectedId(id: string | number | null) {
          patchState(store, { selectedId: id });
        },

        sortItems(compareFn: (a: TModel, b: TModel) => number) {
          const sorted = [...store.entities()].sort(compareFn);
          patchState(store, setAllEntities(sorted));
        },
      };
    }),
  );
}

import { computed } from '@angular/core';
import {
  signalStoreFeature,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { loadingService } from '../loading.service';
import { ToastService } from '../../core/services/toast.service';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestStatusState {
  requestStatus: RequestStatus;
  error: string | null;
}

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({
      requestStatus: 'idle',
      error: null,
    }),
    withComputed((store) => ({
      isLoading: computed(() => store.requestStatus() === 'loading'),
      isSuccess: computed(() => store.requestStatus() === 'success'),
      isError: computed(() => store.requestStatus() === 'error'),
    })),
    withMethods((store) => {
      const globalLoading = inject(loadingService);
      const toast = inject(ToastService);

      return {
        setLoading: () => patchState(store, { requestStatus: 'loading', error: null }),
        setSuccess: () => patchState(store, { requestStatus: 'success', error: null }),
        setError: (error: any) => {
          const message = error?.error?.message || error?.message || 'Something went wrong';
          patchState(store, { requestStatus: 'error', error: message });
          toast.error(message);
        },
        // Reusable request wrapper
        async runRequest<T>(
          task: () => Promise<T>,
          options?: { useGlobalLoading?: boolean },
        ): Promise<T> {
          if (options?.useGlobalLoading) globalLoading.start();
          patchState(store, { requestStatus: 'loading', error: null });

          try {
            const result = await task();
            patchState(store, { requestStatus: 'success', error: null });
            return result;
          } catch (err: any) {
            const message = err?.error?.message || err?.message || 'Something went wrong';
            patchState(store, { requestStatus: 'error', error: message });
            toast.error(message);
            throw err;
          } finally {
            if (options?.useGlobalLoading) globalLoading.stop();
          }
        },
      };
    }),
  );
}

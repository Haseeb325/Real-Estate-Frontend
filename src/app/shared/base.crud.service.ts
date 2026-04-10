import { Signal, inject, WritableSignal, signal } from '@angular/core';
import { tap, finalize, catchError, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from '../core/services/toast.service';
import { getNestedValue } from './utils/common-utils';

export abstract class BaseCrudService<T extends Record<string, any>> {
  protected toastService = inject(ToastService);
  protected apiService = inject(ApiService);

  data: WritableSignal<T[]> = signal([]);
  private detailCache = new Map<any, T> ()
  selectedItem: WritableSignal<T | null> = signal(null);

  loading: WritableSignal<boolean> = signal(false); // 'fetching', 'creating', 'updating', 'deleting', false

  // cache state
  private lastFetched = signal<number | null>(null);
  private cachettl = 30000;
  private inFlight = false;

  // check cache
  private isCacheValid(): boolean {
    const last = this.lastFetched();
    return !!last && Date.now() - last < this.cachettl;
  }

  clearCache() {
    this.lastFetched.set(null);
  }

  // fetch with cache and inflight guard

  protected fetch(request$: Observable<any>, forceRefresh = false, append = false) {
    if (this.inFlight) return;

    if (!forceRefresh && !append && this.isCacheValid()) return;

    if (!append && this.data().length > 0 && !forceRefresh) return;

    this.inFlight = true;
    this.loading.set(true);

    return request$.pipe(
      tap((response) => {
        if (response.status != 200) {
          this.toastService.error(response.message || 'Failed to fetch');
          throw new Error(response.message || 'Failed to fetch');
        }
        console.log('response from api', response.data);

        if (append) {
          this.data.update(items => [...items, ...response.data]);
        } else {
          this.data.set(response.data);
        }
        console.log('data set in service', this.data())
        this.lastFetched.set(Date.now());
      }),

      catchError((error) => {
        this.toastService.error(error.error.message || 'Something went wrong');
        return throwError(() => new Error(error.message || 'Something went wrong'));
      }),

      finalize(() => {
        this.inFlight = false;
        this.loading.set(false);
      }),
    );
  }

//   fetch with id
  fetchById(idValue: any, idKey: string, request$: Observable<any>) {
    this.loading.set(true);

    if (this.selectedItem() && getNestedValue(this.selectedItem(), idKey) === idValue) {
      this.loading.set(false);
      return; // because already selected
    }

    const existing = this.detailCache.get(idValue)
    if (existing) {
        this.selectedItem.set(existing);
      this.loading.set(false);
      return; //   already in cache
    }

    return request$.pipe(
      tap((response) => {
        if (response.status != 200) {
          throwError(() => new Error(response.message || 'Something went'));
        }

       const item = response.data
       this.detailCache.set(idValue,item)
       this.selectedItem.set(item)

//         this.cachedData.update(items=>{
//             const exists = items.find((item)=> getNestedValue(item, idKey) === idValue)
//            return exists
//   ? items.map(i =>
//       getNestedValue(i, idKey) === idValue ? item : i
//     )
//   : [...items, item];
//         })

      }),

      catchError(err =>{
        this.toastService.error(err.message || 'Something went wrong')
        return throwError(() => new Error(err.message || 'Something went wrong'));
      }),
      finalize(() => {
        this.loading.set(false)
      })


    );
  }


// create

protected createItem(
    url:string,
    payload:Partial<T> | FormData
){
    this.loading.set(true)
    return this.apiService.post(url, payload).pipe(
        tap((response:any)=>{
            if(response.status !== 200){
                this.toastService.error(response.message || 'Failed to create')
                throw new Error(response.message || 'Failed to create')
            }
            this.selectedItem.set(response.data)
        }),
        catchError((err)=>{
            this.toastService.error(err.message || 'Failed to create')
            return throwError(() => new Error(err.message || 'Failed to create'))
        }),
        finalize(()=>{
            this.loading.set(false)
        })
    )
}


protected updateItem(
    id:any,
    request$:Observable<any>,
    payload:Partial<T> | FormData,
    idKey: keyof T
){

    const previousState = this.data()

    // optimistic update
    this.data.update(old=>
        old.map(item => item[idKey] == id ? {...item, ...payload} : item)
    )

    return request$.pipe(
        tap(response => {
            if(response.status !== 200){
                this.toastService.error(response.message || 'Failed to update')
                throw new Error(response.message || 'Failed to update')
            }
            this.toastService.success('Updated successfully')

        }),
        catchError(err=>{
             // Rollback
            this.data.set(previousState)
            this.toastService.error(err.message || 'Failed to update')
            return throwError(() => new Error(err.message || 'Failed to update'))
        }),
    )

}



protected deleteItem(
    id:any,
    request$:Observable<any>,
    idKey: keyof T
){

    const previousState = this.data()

    // optimistic update
    this.data.update(old=>
        old.filter(item => item[idKey] !== id)
    )

    return request$.pipe(
        tap(response => {
            if(response.status !== 200){
                this.toastService.error(response.message || 'Failed to delete')
            throwError(()=> new Error(response.message || 'Failed to delete'))
            }
            this.toastService.success('Deleted successfully')
        }),
        catchError(err =>{
            // Rollback
            this.data.set(previousState)
            this.toastService.error(err.message || 'Failed to delete')
            return throwError(() => new Error(err.message || 'Failed to delete'))
        })
    )



}



}

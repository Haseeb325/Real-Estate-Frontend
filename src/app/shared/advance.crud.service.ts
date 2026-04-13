import { computed, inject, signal } from "@angular/core";
import { ApiService } from "./api.service";
import { ToastService } from "../core/services/toast.service";
import { loadingService } from "./loading.service";
import { firstValueFrom } from "rxjs";

export interface postRequestOptions<TModel> {
  url:string,
  payload?:Partial<TModel> | FormData,
  isFormData?: boolean;                 // Flag to skip JSON processing
  autoRefresh?:boolean,
  autoRefreshUrl?:string,
  updateState?:boolean,
  useGlobalLoading?:boolean

}

export abstract class AdvanceCrudService<TModel, TDto = any>{

    protected apiService = inject(ApiService)
    protected toastService = inject(ToastService)
    protected globalLoadingServie = inject(loadingService)

    private _localLoading = signal(false)
    readonly isLoading = computed(() => this._localLoading())

    // optional mapper functions
    protected mapFromDto?: (dto:TDto) => TModel
    protected mapToDto?: (model:TModel) => TDto 

    // states
    public _items = signal<TModel[]>([])
    private _selected = signal<TModel | null>(null)
    private _lastFetched = signal<number | null>(null)
    private detailCache = new Map<any, TModel>()

    public singleFetchedItem = signal<TModel | null>(null)
                            //    key  value 

    readonly items = computed(() => this._items())
    readonly selectedItem = computed(() => this._selected())
    readonly lastFetched = computed(()=> this._lastFetched())

    protected cachettl = 30000

    private isCacheValid():boolean{
        const last = this._lastFetched()
        return !!last && Date.now() - last < this.cachettl
    }

    clearCache(){
        this._lastFetched.set(null)
    }

    setSelectedItem(item:TModel | null){
        this._selected.set(item)
    }

    sortItems(compareFn:(a:TModel, b:TModel) => number){
        this._items.update(items => [...items].sort(compareFn))
    }


    // optional default sorting
    protected _defaultSortFn?: (a:TModel, b:TModel) => number
    
    setDefaultSort(compareFn:(a:TModel, b:TModel) => number){
        this._defaultSortFn = compareFn
    }


    // reuseable request wrapper

    protected async request<R>(fn:() => Promise<R>, useGlobalLoading = false ){
        if(useGlobalLoading) this.globalLoadingServie.start()
         this._localLoading.set(true) 
        try{
            return await fn()
        }
        catch(err:any){
            this.toastService.error(err.error.message || 'Something went wrong')
            throw err
        }
        finally{
            if(useGlobalLoading) this.globalLoadingServie.stop()
                this._localLoading.set(false)
        }
    }



    // Fetch

   async fetch(url:string, params:any = {}, forceRefresh = false, useGlobalLoading = false){
    if(!forceRefresh && this.isCacheValid()) return;
    
    return this.request(async () => {
        const response:any = await firstValueFrom(this.apiService.getWithParams<TDto>(url,params));
        
        if(response.status !== 200){
            throw new Error(response.message || 'Something went wrong');
        } 

        // FIX: Normalize data. If it's a single object (profile), wrap it in an array.
        const rawData = response.data;
        this.singleFetchedItem.set(
            (!Array.isArray(rawData) && rawData) ? (this.mapFromDto ? this.mapFromDto(rawData) : (rawData as TModel)) : null
        );
        const dataArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

        const items: TModel[] = dataArray.map((dto: TDto) => 
            this.mapFromDto ? this.mapFromDto(dto) : (dto as unknown as TModel)
        );

        this._items.set(items);
        this._lastFetched.set(Date.now());

        if(this._defaultSortFn){
            this.sortItems(this._defaultSortFn);
        }
        return items;
    }, useGlobalLoading);
}

    //  Fetch By ID

    async fetchById(url:string, id:any, useGlobalLoading = false){

        const existing = this.detailCache.get(id)
        if(existing){
            this._selected.set(existing)
            return
        }
        return this.request(async()=>{
            const response:any = await firstValueFrom(this.apiService.get(url))
            if(response.status !== 200){
              this.toastService.error(response.message || 'Something went wrong')
                throw new Error(response.message || 'Something went wrong')
            }
           const item = this.mapFromDto ? this.mapFromDto(response.data) : (response.data as TModel)
            this._selected.set(item) 
            this.detailCache.set(id,item)
        },useGlobalLoading)

    }




    // create 
    async create(body:postRequestOptions<TModel>){
        const{
            url,
            payload,
            isFormData,
            autoRefresh,
            autoRefreshUrl,
            updateState,
            useGlobalLoading
        } = body

        return this.request(async()=>{
            let finalBody:any
            if (isFormData){
                finalBody = payload
            }else {
            // Handle JSON or custom toJson() method
            finalBody = (payload as any)?.toJson ? (payload as any).toJson() : payload;
        }
            const response:any = await firstValueFrom(this.apiService.post(url,finalBody))
            if (response.status != 200){
                this.toastService.error(response.message)
                throw new Error (response.message || 'Something wwent wrong')
            } 

            const rawData = response.data

            // Handle both array and single object
            const mappedData = Array.isArray(rawData)
            ? rawData.map((dto:any) => this.mapFromDto ? this.mapFromDto(dto) : (dto as TModel))
            :this.mapFromDto ? this.mapFromDto(rawData) : (rawData as TModel)
            
            if(updateState){
                if (Array.isArray(mappedData)){
                    this._items.set(mappedData)
                }else{
                    this._items.update(items=>items.some(i => (i as any)?.id === (mappedData as any)?.id) ? items : [...items,mappedData])
                }
            }

            if(autoRefresh){
              await this.fetch(autoRefreshUrl || url ,{},true,useGlobalLoading)
            }
            this.toastService.success('Created successfully')

            return mappedData

        },useGlobalLoading)

    }



    // update 

    async update(options: postRequestOptions<TModel>) {
    const {
        url,
        payload,
        isFormData,
        autoRefresh,
        useGlobalLoading
    } = options;

    return this.request(async () => {
        // 1. Handle Body Transformation
        let finalBody: any;
        if (isFormData) {
            finalBody = payload;
        } else {
            finalBody = (payload as any)?.toJson ? (payload as any).toJson() : payload;
        }

        // 2. Use PATCH or PUT based on your API requirements
        const response: any = await firstValueFrom(this.apiService.patch(url, finalBody));

        if (response.status !== 200) {
            throw new Error(response.message || 'Update failed');
        }

        // 3. Map Response (Handles both single object and list)
        const rawData = response.data;
        const item = this.mapFromDto ? this.mapFromDto(rawData) : (rawData as TModel);

        // 4. Smart State Update
        this._items.update(items => {
            if (Array.isArray(item)) {
                // If backend returns a list, refresh the whole list
                return item;
            }
            // If backend returns one object, find and replace it in the signal
            return items.map(i => (i as any).id === (item as any).id ? item : i);
        });

        // 5. Update Selected Item if it's the one we just edited
        const currentSelected = this._selected();
        if (currentSelected && (currentSelected as any).id === (item as any).id) {
            this._selected.set(item);
        }

        if (autoRefresh) {
            await this.fetch(url, {}, true, useGlobalLoading);
        }

        this.toastService.success('Updated successfully');
        return item;

    }, useGlobalLoading);
}

    async delete(url:string, id:any, autoRefresh = false, useGlobalLoading = false){

        return this.request(async()=>{
            const response:any = await firstValueFrom(this.apiService.delete(url))
            if(response.status !== 200){
                throw new Error(response.message || 'Something went wrong')
            
            }

             this._items.update(items => items.filter(item => (item as any ).id !== id))
             this.detailCache.delete(id)
             if(autoRefresh){
                await this.fetch(url,{},true,useGlobalLoading)
             }
             this.toastService.success(response.data.message ||'Deleted successfully')
            return response.data

        },useGlobalLoading)

    }


}

import { computed, inject, signal } from "@angular/core";
import { ApiService } from "./api.service";
import { ToastService } from "../core/services/toast.service";
import { loadingService } from "./loading.service";
import { firstValueFrom } from "rxjs";

export interface postRequestOptions<TModel> {
  url:string,
  payload?:Partial<TModel>,
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
            this.toastService.error(err.message || 'Something went wrong')
            throw err
        }
        finally{
            if(useGlobalLoading) this.globalLoadingServie.stop()
                this._localLoading.set(false)
        }
    }



    // Fetch

    async fetch(url:string, params:any = {}, forceRefresh = false, useGlobalLoading = false){
        if(!forceRefresh && this.isCacheValid()) return 
        
        return this.request
        (async () => {
            const response:any = await firstValueFrom(this.apiService.getWithParams<TDto>(url,params))
            if(response.status !== 200){
                throw new Error(response.message || 'Something went wrong')
            } 

            const items:TModel[] = (response.data || []).map((dto:TDto)=> this.mapFromDto ? this.mapFromDto(dto) : (dto as unknown as TModel))
            this._items.set(items)
            this._lastFetched.set(Date.now())

            if(this._defaultSortFn){
                this.sortItems(this._defaultSortFn)
            }

        },useGlobalLoading)

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
            autoRefresh,
            autoRefreshUrl,
            updateState,
            useGlobalLoading
        } = body

        return this.request(async()=>{
            const body = (payload as any)?.toJson()
            ? (payload as any).toJson()
            :payload
            const response:any = await firstValueFrom(this.apiService.post(url,body))
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

    async update(url:string, payload:Partial<TModel>, autoRefresh = false, useGlobalLoading = false){
        return this.request(async()=>{
            const response:any = await firstValueFrom(this.apiService.patch(url,payload))
            if(response.status !== 200){
                this.toastService.error(response.message || 'Something went wrong')
                throw new Error(response.message || 'Something went wrong')
            }
            this.toastService.success('Updated successfully')
            
            const item  = this.mapFromDto ? this.mapFromDto(response.data) : (response.data as TModel)

            this._items.update(items => items.map(i => (i as any).id === (item as any).id ? item : i))

            if(autoRefresh){
                await this.fetch(url,{},true,useGlobalLoading)
            }
            return item

        },useGlobalLoading)
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







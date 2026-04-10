import { Injectable, signal, computed } from "@angular/core";

@Injectable({
  providedIn: 'root'  
})

export class loadingService {

    private _loadingCount = signal(0)

    readonly isLoading = computed(()=> this._loadingCount() > 0)

    start(){
        this._loadingCount.update(count=> count +1)
        
    }

    stop(){
        this._loadingCount.update(v => Math.max(0, v - 1))
    }

}
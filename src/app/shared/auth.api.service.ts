import { Injectable } from "@angular/core";
import { HttpBackend,HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class AuthApiService {
    private http: HttpClient;

    constructor(handler:HttpBackend){
this.http = new HttpClient(handler)
    }

    private getTempToken(){
        return localStorage.getItem('tempToken')
    }

    get(url:string,):Observable<any>{
        const headers = new HttpHeaders({
             Authorization: `Bearer ${this.getTempToken()}`
        })
        return this.http.get(url, {headers})
    }

    post(url:string, body:any):Observable<any>{
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.getTempToken()}`
       })
       return this.http.post(url, body, {
         headers,
         withCredentials: true 
       })
    }

}

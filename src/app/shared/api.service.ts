import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  // ---------------- GET ----------------
  get<T>(url: string, options?:{headers?:Record<string,string>,withCredentials?:boolean}): Observable<T> {
    return this.http.get<T>(url,{...options}) 
  }

  getWithParams<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(url, { params });
  }

  getBlob(url: string, params?: any): Observable<Blob> {
    return this.http.get(url, {
      params,
      responseType: 'blob'
    });
  }

  // ---------------- POST ----------------
  post<T>(url: string, body: any, options?:{headers?:Record<string,string>,withCredentials?:boolean}): Observable<T> {
    return this.http.post<T>(url, body,{...options})
  }

  postFormData<T>(url: string, body: FormData): Observable<T> {
    return this.http.post<T>(url, body);
  }

  // ---------------- PATCH ----------------
  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body);
  }

  patchFormData<T>(url: string, body: FormData): Observable<T> {
    return this.http.patch<T>(url, body);
  }

  // ---------------- PUT ----------------
  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  putFormData<T>(url: string, body: FormData): Observable<T> {
    return this.http.put<T>(url, body);
  }

  // ---------------- DELETE ----------------
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }

  deleteWithBody<T>(url: string, body: any): Observable<T> {
    return this.http.delete<T>(url, { body });
  }
  
  verifyToken(url: string, body: any): Observable<any> {
  return this.http.post(url, body);
}

}
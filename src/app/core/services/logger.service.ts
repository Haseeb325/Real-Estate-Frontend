import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private isLocal(): boolean {
    return environment.production === false;
  }

  log(message: any, ...optionalParams: any[]): void {
    if (this.isLocal()) {
      console.log(message, ...optionalParams);
    }
  }

  error(message: any, ...optionalParams: any[]): void {
    if (this.isLocal()) {
      console.error(message, ...optionalParams);
    }
  }

  warn(message: any, ...optionalParams: any[]): void {
    if (this.isLocal()) {
      console.warn(message, ...optionalParams);
    }
  }

  info(message: any, ...optionalParams: any[]): void {
    if (this.isLocal()) {
      console.info(message, ...optionalParams);
    }
  }
}

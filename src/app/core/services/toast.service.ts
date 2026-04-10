// this.apiService.postRequest('/api', data).subscribe({
//   next: () => this.toast.success('Saved successfully'),
//   error: () => this.toast.error('API failed')
// });         // i will also use like this

import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  messageService: MessageService = inject(MessageService);

  success(detail: string, summary: string = 'Success') {
    this.messageService.add({
         severity: 'success',
         summary: summary,
         detail: detail,
         life: 3000 });
  }

  error(detail: string, summary: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000,
    });
  }

  warn(detail: string, summary: string = 'Warning') {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 4000,
    });
  }

  info(detail: string, summary: string = 'Info') {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
    });
  }

  clear() {
    this.messageService.clear();
  }
}

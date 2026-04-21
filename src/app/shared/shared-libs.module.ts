import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import ToastModule from 'primeng/toast';


@NgModule({
  exports: [
    // Angular core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // PrimeNG
    CheckboxModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputOtpModule,
    TableModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
  ]
})
export class SharedLibsModule {}
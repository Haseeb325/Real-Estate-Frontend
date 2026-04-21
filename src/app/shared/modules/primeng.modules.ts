import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
// import { ContainerComponent } from '../components/container/container.component';
// import { InputFieldComponent } from './forms/input-field/input-field.component';
import { NgApexchartsModule } from 'ng-apexcharts';
// import { SocialLoginButtonComponent } from './buttons/social-login-button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
// import { AutofocusDirective } from '../directives/autofocus.directive';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
// import { TranslatePipe } from '../pipes/translate.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
// import { TableLoaderComponent } from '../components/table-loader/table-loader.component';
import { PopoverModule } from 'primeng/popover';
// import { PButtonComponent } from './p-button/p-button.component';
import { DrawerModule } from 'primeng/drawer';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const shared = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterLink,
  NgApexchartsModule,
  // TranslatePipe,
  // ContainerComponent,
  // AutofocusDirective,
  // SocialLoginButtonComponent
  // TableLoaderComponent,
  // PButtonComponent,
];

// TranslatePipe
const primeNg = [
  CheckboxModule,
  ButtonModule,
  InputOtpModule,
  TableModule,
  InputText,
  DatePickerModule,
  InputGroupModule,
  InputGroupAddonModule,
  PasswordModule,
  InputMaskModule,
  InputNumberModule,
  SelectModule,
  TextareaModule,
  DynamicDialogModule,
  ProgressSpinnerModule,
  SkeletonModule,
  PaginatorModule,
  PopoverModule,
  DrawerModule,
  MessageModule,
  MenuModule,
  AccordionModule,
  ConfirmDialogModule,
];

@NgModule({
  declarations: [],
  imports: [...shared, ...primeNg],
  exports: [...shared, ...primeNg],
})
export class PrimeNgModules {}

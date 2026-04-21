// src/app/shared/shared.ts
import { NgModule } from '@angular/core';
import { SharedLibsModule } from './shared-libs.module';

// Your shared components & directives
import { InputField } from './components/input-field/input-field';
import { PrimeNgInputField } from './components/primeng-input-field/primeng-input-field';
import { PrimeNgSelectField } from './components/primeng-select-field/primeng-select-field';
import { AutoFocusDirective } from './directives/autofocus.directive';

@NgModule({
  imports: [
    SharedLibsModule,

    // Shared components & directives
    InputField,
    PrimeNgInputField,
    PrimeNgSelectField,
    AutoFocusDirective,
  ],
  exports: [
    SharedLibsModule,
    InputField,
    PrimeNgInputField,
    PrimeNgSelectField,
    AutoFocusDirective,
  ]
})
export class Shared {}
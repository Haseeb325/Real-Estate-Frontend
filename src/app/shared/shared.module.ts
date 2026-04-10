// src/app/shared/shared.ts
import { NgModule } from '@angular/core';
import { SharedLibsModule } from './shared-libs.module';

// Your shared components & directives
import { InputField } from './components/input-field/input-field';
import { AutoFocusDirective } from './directives/autofocus.directive';

@NgModule({
  imports: [
    SharedLibsModule,

    // Shared components & directives
    InputField,
    AutoFocusDirective,
  ],
  exports: [
    SharedLibsModule,
    InputField,
    AutoFocusDirective,
  ]
})
export class Shared {}
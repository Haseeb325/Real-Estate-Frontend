import { ElementRef, Directive, AfterViewInit } from "@angular/core";

@Directive({
    selector:'[appAutoFocus]'
})

export class AutoFocusDirective implements AfterViewInit{
    constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Wait until child views render
    setTimeout(() => {
      const element = this.host.nativeElement;

      // ✅ Works for both native inputs and wrapped ones (like <app-input-field>)
      let input: HTMLInputElement | null = null;

      if (element.tagName.startsWith('APP-')) {
        // custom component like <app-input-field>
        input = element.querySelector('input');
      } else if (element instanceof HTMLInputElement) {
        input = element;
      }

      if (input && !input.disabled) {
        input.focus();
      }
    }, 100); // delay avoids timing issues in complex templates
  }
}
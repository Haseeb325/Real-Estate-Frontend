import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shared } from '../../shared/shared.module';

@Component({
  selector: 'app-popup-backdrop',
  imports: [CommonModule,Shared],
  templateUrl: './popup-backdrop.html',
  styleUrl: './popup-backdrop.scss',
})
export class PopupBackdrop implements OnDestroy {

   @Input() closeOnOutsideClick:boolean = false;
  @Input() layoutKey:string = 'center'
  @Input() classes:string = '';
  @Output() onClose = new EventEmitter()
  isOpen: boolean = false;
  // resolutionService:ResolutionService = inject(ResolutionService)
  constructor() {
    this.isOpen = true;
    // this.resolutionService.toggleBodyScroll(false);
  }
  @Input() customBgColor:string= ' bg-black/60'
  @Input() pading_bottom:string = '24px'  


  // getOuterLayout(){
  //   switch(this.layoutKey){
  //     case('topFixed'):
  //     return 'topFixed'
  //     default:
  //       return ''
  //   }
  // }

  getPosition(){
    switch(this.layoutKey){
      case('bottom'):
      return 'bottom';
      case('center-bottom'):
      return 'center-bottom';
      case('top'):
      return 'top';
       case('topFixed'):
      return 'topFixed'
      default:
        return 'center'
    }

  }

  ngOnDestroy() {
    this.isOpen = false;
    this.onClose.emit();
    // this.resolutionService.toggleBodyScroll();
  }

  closePopup(){
    if(this.closeOnOutsideClick){
      this.isOpen = false;
      this.onClose.emit();
      // this.resolutionService.toggleBodyScroll();
    }
  }
}

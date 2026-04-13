import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupBackdrop } from './popup-backdrop';

describe('PopupBackdrop', () => {
  let component: PopupBackdrop;
  let fixture: ComponentFixture<PopupBackdrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupBackdrop],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupBackdrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStep4 } from './reg-step-4';

describe('RegStep4', () => {
  let component: RegStep4;
  let fixture: ComponentFixture<RegStep4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegStep4],
    }).compileComponents();

    fixture = TestBed.createComponent(RegStep4);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

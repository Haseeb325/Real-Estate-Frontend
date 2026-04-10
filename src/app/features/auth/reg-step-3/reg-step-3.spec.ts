import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStep3 } from './reg-step-3';

describe('RegStep3', () => {
  let component: RegStep3;
  let fixture: ComponentFixture<RegStep3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegStep3],
    }).compileComponents();

    fixture = TestBed.createComponent(RegStep3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

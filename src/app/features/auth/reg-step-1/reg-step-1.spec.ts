import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStep1 } from './reg-step-1';

describe('RegStep1', () => {
  let component: RegStep1;
  let fixture: ComponentFixture<RegStep1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegStep1],
    }).compileComponents();

    fixture = TestBed.createComponent(RegStep1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

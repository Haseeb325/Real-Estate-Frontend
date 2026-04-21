import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseDetailForm } from './house-detail-form';

describe('HouseDetailForm', () => {
  let component: HouseDetailForm;
  let fixture: ComponentFixture<HouseDetailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HouseDetailForm],
    }).compileComponents();

    fixture = TestBed.createComponent(HouseDetailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

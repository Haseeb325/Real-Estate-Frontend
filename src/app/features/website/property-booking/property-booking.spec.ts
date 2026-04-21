import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBooking } from './property-booking';

describe('PropertyBooking', () => {
  let component: PropertyBooking;
  let fixture: ComponentFixture<PropertyBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

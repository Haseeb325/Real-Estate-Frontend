import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentDetailForm } from './apartment-detail-form';

describe('ApartmentDetailForm', () => {
  let component: ApartmentDetailForm;
  let fixture: ComponentFixture<ApartmentDetailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApartmentDetailForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentDetailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

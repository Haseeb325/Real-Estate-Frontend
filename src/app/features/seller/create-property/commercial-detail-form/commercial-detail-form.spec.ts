import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialDetailForm } from './commercial-detail-form';

describe('CommercialDetailForm', () => {
  let component: CommercialDetailForm;
  let fixture: ComponentFixture<CommercialDetailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialDetailForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CommercialDetailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

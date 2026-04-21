import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotAndLandDetailForm } from './plot-and-land-detail-form';

describe('PlotAndLandDetailForm', () => {
  let component: PlotAndLandDetailForm;
  let fixture: ComponentFixture<PlotAndLandDetailForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotAndLandDetailForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PlotAndLandDetailForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

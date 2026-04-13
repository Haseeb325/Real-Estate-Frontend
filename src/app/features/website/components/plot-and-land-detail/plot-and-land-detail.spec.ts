import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotAndLandDetail } from './plot-and-land-detail';

describe('PlotAndLandDetail', () => {
  let component: PlotAndLandDetail;
  let fixture: ComponentFixture<PlotAndLandDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotAndLandDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PlotAndLandDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

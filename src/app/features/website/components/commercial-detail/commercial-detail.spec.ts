import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialDetail } from './commercial-detail';

describe('CommercialDetail', () => {
  let component: CommercialDetail;
  let fixture: ComponentFixture<CommercialDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(CommercialDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

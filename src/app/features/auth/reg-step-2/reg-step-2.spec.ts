import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStep2 } from './reg-step-2';

describe('RegStep2', () => {
  let component: RegStep2;
  let fixture: ComponentFixture<RegStep2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegStep2],
    }).compileComponents();

    fixture = TestBed.createComponent(RegStep2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

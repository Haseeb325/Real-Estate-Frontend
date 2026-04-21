import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimeNgSelectField } from './primeng-select-field';

describe('PrimeNgSelectField', () => {
  let component: PrimeNgSelectField;
  let fixture: ComponentFixture<PrimeNgSelectField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeNgSelectField],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimeNgSelectField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimeNgInputField } from './primeng-input-field';

describe('PrimeNgInputField', () => {
  let component: PrimeNgInputField;
  let fixture: ComponentFixture<PrimeNgInputField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeNgInputField],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimeNgInputField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

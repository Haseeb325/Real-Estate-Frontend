import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Shared } from '../../../../shared/shared.module';
import { AvailabilityService } from '../../seller-dashboard/availability.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-seller-availability',
  standalone: true,
  imports: [Shared, MultiSelectModule, DatePickerModule, ReactiveFormsModule],
  templateUrl: './seller-availability.html',
  styleUrl: './seller-availability.scss',
})
export class SellerAvailability implements OnInit {
  @Input() propertyId!: string;
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private availabilityService = inject(AvailabilityService);

  availabilityForm: FormGroup;
  existingAvailabilityId = signal<string | null>(null);
  isLoading = this.availabilityService.isLoading;
  isDropdownOpen = signal(false);

  days = [
    { label: 'Monday', value: 0 },
    { label: 'Tuesday', value: 1 },
    { label: 'Wednesday', value: 2 },
    { label: 'Thursday', value: 3 },
    { label: 'Friday', value: 4 },
    { label: 'Saturday', value: 5 },
    { label: 'Sunday', value: 6 },
  ];

  constructor() {
    this.availabilityForm = this.fb.group({
      days_of_week: [[], [Validators.required]],
      start_time: [null, [Validators.required]],
      end_time: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadAvailability();
  }

  loadAvailability() {
    this.availabilityService.getAvailabilities().subscribe({
      next: (res: any) => {
        // Find availability for this specific property
        const avail = res.data.find((a: any) => a.property === this.propertyId);
        if (avail) {
          this.existingAvailabilityId.set(avail.id);
          
          // Parse HH:MM:SS to Date object for PrimeNG DatePicker
          const today = new Date();
          const startParts = avail.start_time.split(':');
          const endParts = avail.end_time.split(':');
          
          const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(startParts[0]), parseInt(startParts[1]), parseInt(startParts[2]));
          const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(endParts[0]), parseInt(endParts[1]), parseInt(endParts[2]));

          // Backend might return day names or integers depending on serializer to_representation
          // Based on the user request, the payload uses integers [1, 2]
          // The serializer maps them to strings for storage, but to_representation returns instance.days_of_week
          // I'll assume they come back as integers or I'll map them if they are strings.
          let selectedDays = avail.days_of_week;
          if (selectedDays.length > 0 && typeof selectedDays[0] === 'string') {
             const dayMap: any = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
             selectedDays = selectedDays.map((d: string) => dayMap[d]);
          }

          this.availabilityForm.patchValue({
            days_of_week: selectedDays,
            start_time: startTime,
            end_time: endTime,
          });
        }
      },
    });
  }

  formatTime(date: Date): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  submit() {
    if (this.availabilityForm.invalid) return;

    const formValue = this.availabilityForm.value;
    const payload = {
      property: this.propertyId,
      days_of_week: formValue.days_of_week,
      start_time: this.formatTime(formValue.start_time),
      end_time: this.formatTime(formValue.end_time),
    };

    if (this.existingAvailabilityId()) {
      this.availabilityService.updateAvailability(this.existingAvailabilityId()!, payload).subscribe({
        next: () => this.close.emit(),
      });
    } else {
      this.availabilityService.createAvailability(payload).subscribe({
        next: () => this.close.emit(),
      });
    }
  }

  delete() {
    if (this.existingAvailabilityId()) {
      this.availabilityService.deleteAvailability(this.existingAvailabilityId()!).subscribe({
        next: () => this.close.emit(),
      });
    }
  }
}

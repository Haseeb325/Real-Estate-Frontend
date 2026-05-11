import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WebSiteService } from '../website.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { MessageList } from '../../../shared/components/chat-inbox/message-list/message-list';
import { MessageInput } from '../../../shared/components/chat-inbox/message-input/message-input';
import { PaymentStore } from '../../../shared/stores/paymentStore';
import { FormsModule } from '@angular/forms';

export interface AvailabilityRule {
  id: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
}

export interface AvailableDate {
  date: Date;
  dayName: string;
  dayShort: string;
  dayNum: string;
  monthShort: string;
  rule: AvailabilityRule;
}

@Component({
  selector: 'app-property-booking',
  standalone: true,
  imports: [CommonModule, MessageList, MessageInput, FormsModule],
  templateUrl: './property-booking.html',
  styleUrl: './property-booking.scss',
  providers: [DatePipe],
})
export class PropertyBooking implements OnInit, OnDestroy {
  websiteService = inject(WebSiteService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  chatService = inject(ChatService);
  datePipe = inject(DatePipe);

  selectedProperty = this.websiteService.selectedProperty;
  purchaseType = this.route.snapshot.paramMap.get('purchase_type');
  id = this.route.snapshot.paramMap.get('id');

  availabilities = signal<AvailabilityRule[]>([]);
  availableDates = signal<AvailableDate[]>([]);
  availableSlots = signal<string[]>([]);

  selectedDate = signal<AvailableDate | null>(null);
  selectedSlot = signal<string | null>(null);
  isBooking = signal(false);

  // Payment/Rent Fields
  paymentStore = inject(PaymentStore);
  rentMonths = signal<number>(6);
  rentStartDate = signal<string>(new Date().toISOString().split('T')[0]);
  isProcessingPayment = this.paymentStore.isLoading;

  totalPayNow = computed(() => {
    const property = this.selectedProperty();
    if (!property) return 0;

    if (this.purchaseType === 'rent') {
      const rent = parseFloat(property.rent_price || '0') || 0;
      const deposit = parseFloat(property.security_deposit || '0') || 0;
      return rent + deposit;
    }

    return parseFloat(property.sale_price || '0') || 0;
  });

  ngOnInit() {
    if (this.id) {
      this.websiteService.fetchPropertyById(this.id)?.subscribe();
      this.fetchAvailability();
    }
  }

  fetchAvailability() {
    this.websiteService.getPropertyAvailability(this.id).subscribe({
      next: (res: any) => {
        const rules = res.data?.results || res.data || res;
        this.availabilities.set(rules);
        this.generateDates(rules);
      },
      error: (err) => console.error('Failed to fetch availability', err),
    });
  }

  generateDates(rules: AvailabilityRule[]) {
    const dates: AvailableDate[] = [];
    const today = new Date();

    const availableDaysMap = new Map<string, AvailabilityRule>();
    rules.forEach((rule) => {
      rule.days_of_week.forEach((day) => {
        availableDaysMap.set(day, rule);
      });
    });

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

      if (availableDaysMap.has(dayName)) {
        dates.push({
          date: d,
          dayName: dayName,
          dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate().toString().padStart(2, '0'),
          monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
          rule: availableDaysMap.get(dayName)!,
        });
      }
    }

    this.availableDates.set(dates);
    if (dates.length > 0) {
      this.selectDate(dates[0]);
    }
  }

  selectDate(dateObj: AvailableDate) {
    this.selectedDate.set(dateObj);
    this.selectedSlot.set(null);
    this.generateSlots(dateObj.rule);
  }

  generateSlots(rule: AvailabilityRule) {
    const slots: string[] = [];
    const [startH, startM] = rule.start_time.split(':').map(Number);
    const [endH, endM] = rule.end_time.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      const timeStr = current.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      slots.push(timeStr);
      current.setHours(current.getHours() + 1);
    }

    this.availableSlots.set(slots);
  }

  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
  }

  confirmVisit() {
    const dateObj = this.selectedDate();
    const slot = this.selectedSlot();
    const property: any = this.selectedProperty();

    if (!dateObj || !slot || !property) {
      alert('Please select a valid date and time slot.');
      return;
    }

    this.isBooking.set(true);

    const [slotH, slotM] = slot.split(':').map(Number);
    const startDateTime = new Date(dateObj.date);
    startDateTime.setHours(slotH, slotM, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(slotH + 1, slotM, 0, 0);

    const payload = {
      property: property.id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
    };

    this.websiteService.createAppointment(payload).subscribe({
      next: (res: any) => {
        this.isBooking.set(false);
        alert('Visit confirmed successfully! The seller will review your request.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isBooking.set(false);
        console.error(err);
        alert(err.error?.message || err.error?.time_error || 'Failed to confirm visit.');
      },
    });
  }

  async confirmBooking() {
    const property: any = this.selectedProperty();
    if (!property) return;

    const payload: any = {
      property_id: property.id,
      payment_type: this.purchaseType === 'Buy' ? 'sale' : 'initial_rent',
    };

    if (this.purchaseType === 'rent') {
      if (!this.rentStartDate()) {
        this.paymentStore.toastService.error('Please select a move-in date.');
        return;
      }
      if (!this.rentMonths()) {
        this.paymentStore.toastService.error('Please select the rental duration.');
        return;
      }
      payload.months = this.rentMonths();
      payload.start_date = this.rentStartDate();
    }

    try {
      await this.paymentStore.processPayment(payload);
      // Success is handled by the store (toast + data refresh)
      this.router.navigate(['/dashboard/bookings']);
    } catch (err) {
      // Error handled by store toast
    }
  }

  getFormattedPrice(): string {
    const property = this.selectedProperty();
    if (!property) return '0';

    const rawPrice = this.purchaseType === 'Buy' ? property.sale_price : property.rent_price;

    if (!rawPrice) return '0';

    return rawPrice.toString().split(/[. ]/)[0];
  }

  async startChat() {
    const property: any = this.selectedProperty();
    if (!property || !property.id || !property.user?.id) return;

    const session = await this.chatService.createSession(property.id, property.user.id);
    if (session) {
      this.chatService.selectSession(session);
    }
  }

  ngOnDestroy() {
    this.chatService.disconnectAll();
  }
}

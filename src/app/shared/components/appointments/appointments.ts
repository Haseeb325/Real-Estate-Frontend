import { Component, computed, inject, signal } from '@angular/core';
import { AppointmentStore } from '../../stores/appointmentStore';
import { Shared } from '../../shared.module';
import { AuthStore } from '../../authStore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  imports: [Shared],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
})
export class Appointments {
  store = inject(AppointmentStore);
  authStore = inject(AuthStore);
  router = inject(Router);

  currentUser = this.authStore.user;
  loading = this.store.loading;

  // Tab state
  activeTab = signal<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  ngOnInit() {
    this.store.loadAppointments(true).subscribe();
  }

  async onConfirm(id: string) {
    await this.store.performAction(id, 'confirm');
  }

  async onCancel(id: string) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await this.store.performAction(id, 'cancel');
    }
  }

  async onComplete(id: string) {
    await this.store.performAction(id, 'complete');
  }

  onReschedule(appointment: any) {
    // Redirect to property booking page
    this.router.navigate(['/detail', appointment.property], {
      queryParams: { reschedule: true, appointmentId: appointment.id },
    });
  }
}

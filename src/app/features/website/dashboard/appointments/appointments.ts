import { Component } from '@angular/core';
import { Appointments as AppointmentsComponent } from '../../../../shared/components/appointments/appointments';

@Component({
  selector: 'app-dashboard-appointments',
  imports: [AppointmentsComponent],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
})
export class Appointments {}

import { Component } from '@angular/core';
import { ChatInbox } from '../../../shared/components/chat-inbox/chat-inbox';
import { Appointments } from '../../../shared/components/appointments/appointments';

@Component({
  selector: 'app-dashboard',
  imports: [ChatInbox, Appointments],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}

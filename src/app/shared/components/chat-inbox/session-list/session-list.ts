import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSession } from '../../../../core/models/chat.models';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.html',
  styleUrl: './session-list.scss',
})
export class SessionList {
  sessions = input.required<ChatSession[]>();
  activeSessionId = input<string | null>(null);
  isLoading = input(false);
  currentUserUsername = input<string | undefined>(undefined);

  sessionSelected = output<ChatSession>();

  onSelectSession(session: ChatSession): void {
    this.sessionSelected.emit(session);
  }

  getOtherUser(session: ChatSession) {
    const me = this.currentUserUsername()?.toLowerCase();
    if (!me) return session.buyer; // Default to buyer if not sure
    return session.buyer.username.toLowerCase() === me ? session.seller : session.buyer;
  }

  formatTime(timestamp: string | null): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

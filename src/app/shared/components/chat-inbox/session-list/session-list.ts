import { Component, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSession } from '../../../../core/models/chat.models';
import { GlobalNotificationService } from '../../../../core/services/global-notification.service';
import { getCloudinaryUrl } from '../../../../shared/utils/common-utils';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.html',
  styleUrl: './session-list.scss',
})
export class SessionList {
  globalNotification = inject(GlobalNotificationService);
  sessions = input.required<ChatSession[]>();
  activeSessionId = input<string | null>(null);
  isLoading = input(false);
  currentUserUsername = input<string | undefined>(undefined);

  sessionSelected = output<ChatSession>();

  searchTerm = signal('');
  private debounceTimer: any = null;

  // Filter sessions based on search term
  filteredSessions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.sessions();

    return this.sessions().filter(session => {
      const other = this.getOtherUser(session);
      const name = (other.full_name || other.username || '').toLowerCase();
      const property = (session.property?.title || '').toLowerCase();
      return name.includes(term) || property.includes(term);
    });
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      this.searchTerm.set(value);
      
      // Auto-select first matching session if search has results
      const filtered = this.filteredSessions();
      if (filtered.length > 0 && value.trim()) {
        this.sessionSelected.emit(filtered[0]);
      }
    }, 300);
  }

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

  getCloudinary = getCloudinaryUrl;
}

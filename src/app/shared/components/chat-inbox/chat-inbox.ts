import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionList } from './session-list/session-list';
import { MessageList } from './message-list/message-list';
import { MessageInput } from './message-input/message-input';
import { ChatService } from '../../../core/services/chat.service';
import { GlobalNotificationService } from '../../../core/services/global-notification.service';

// ═══════════════════════════════════════════════════════════
// ChatInbox — Reusable Shell Component
//
// Used by:
//   - seller/chats   → <app-chat-inbox />
//   - buyer/inquiries (future) → <app-chat-inbox />
//
// Composes: SessionList + MessageList + MessageInput
// All data flows through ChatService signals.
// ═══════════════════════════════════════════════════════════

@Component({
  selector: 'app-chat-inbox',
  standalone: true,
  imports: [CommonModule, SessionList, MessageList, MessageInput],
  templateUrl: './chat-inbox.html',
  styleUrl: './chat-inbox.scss',
})
export class ChatInbox implements OnInit, OnDestroy {
  chatService = inject(ChatService);
  globalNotification = inject(GlobalNotificationService);

  ngOnInit(): void {
    this.chatService.loadSessions();
  }

  ngOnDestroy(): void {
    this.chatService.disconnectAll();
  }

  formatLastSeen(isoString: string | null): string {
    if (!isoString) return 'a while ago';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  }
}

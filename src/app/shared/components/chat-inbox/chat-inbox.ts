import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionList } from './session-list/session-list';
import { MessageList } from './message-list/message-list';
import { MessageInput } from './message-input/message-input';
import { ChatService } from '../../../core/services/chat.service';

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

  ngOnInit(): void {
    this.chatService.loadSessions();
  }

  ngOnDestroy(): void {
    this.chatService.disconnectAll();
  }
}

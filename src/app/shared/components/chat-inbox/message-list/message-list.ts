import { Component, input, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatSession } from '../../../../core/models/chat.models';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageList {
  messages = input.required<ChatMessage[]>();
  currentUserId = input<string | number | undefined>(undefined);
  currentUserUsername = input<string | undefined>(undefined);
  activeSession = input<ChatSession | null>(null);
  isLoading = input(false);

  private scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    // Auto-scroll to bottom when new messages arrive
    effect(() => {
      const msgs = this.messages(); // track the signal
      if (msgs.length > 0) {
        // Schedule scroll after DOM update
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  isOwnMessage(message: any): boolean {
    const currentId = this.currentUserId()?.toString();
    const currentUsername = this.currentUserUsername()?.toLowerCase();
    
    // Extract message sender details
    let msgSenderId: string | undefined = undefined;
    let msgSenderUsername: string | undefined = undefined;

    if (message.sender && typeof message.sender === 'object') {
      msgSenderId = message.sender.id?.toString();
      msgSenderUsername = message.sender.username?.toString().toLowerCase();
    } else {
      msgSenderId = message.sender?.toString();
      msgSenderUsername = message.sender_username?.toString().toLowerCase();
    }

    // 1. Direct match (Ignore '0' as it's a fallback ID in normalizeSession)
    if (currentId && msgSenderId && currentId !== '0' && currentId === msgSenderId) {
      return true;
    }
    
    if (currentUsername && msgSenderUsername && currentUsername === msgSenderUsername) {
      return true;
    }

    // 2. Infer from session roles
    const session = this.activeSession();
    if (session) {
      const amIBuyer = (currentId && currentId !== '0' && session.buyer?.id?.toString() === currentId) || 
                       (currentUsername && session.buyer?.username?.toLowerCase() === currentUsername);
      const amISeller = (currentId && currentId !== '0' && session.seller?.id?.toString() === currentId) || 
                        (currentUsername && session.seller?.username?.toLowerCase() === currentUsername);

      const msgIsFromBuyer = (msgSenderId && msgSenderId !== '0' && session.buyer?.id?.toString() === msgSenderId) ||
                             (msgSenderUsername && session.buyer?.username?.toLowerCase() === msgSenderUsername);
      const msgIsFromSeller = (msgSenderId && msgSenderId !== '0' && session.seller?.id?.toString() === msgSenderId) ||
                              (msgSenderUsername && session.seller?.username?.toLowerCase() === msgSenderUsername);

      if (amIBuyer && msgIsFromBuyer) return true;
      if (amISeller && msgIsFromSeller) return true;
    }

    // 3. Last resort path check (for testing)
    if (window.location.pathname.includes('/seller/') && msgSenderUsername === session?.seller?.username?.toLowerCase()) {
      return true;
    }
    if (window.location.pathname.includes('/property-booking') && msgSenderUsername === session?.buyer?.username?.toLowerCase()) {
      return true;
    }

    return false;
  }

  getAvatarInitial(message: any): string {
    if (this.isOwnMessage(message)) {
      return (this.currentUserUsername() || 'M')[0].toUpperCase();
    }
    
    // Use sender_username if available
    if (message.sender_username) return message.sender_username[0].toUpperCase();
    
    // Fallback to sender object
    if (message.sender && typeof message.sender === 'object' && message.sender.username) {
      return message.sender.username[0].toUpperCase();
    }

    // Fallback to session
    const session = this.activeSession();
    if (session) {
      // If I am NOT the buyer, then the other person is the buyer
      const currentUsername = this.currentUserUsername()?.toLowerCase();
      const isMeBuyer = session.buyer?.username?.toLowerCase() === currentUsername;
      const otherUser = isMeBuyer ? session.seller : session.buyer;
      return (otherUser?.username || 'U')[0].toUpperCase();
    }

    return 'U';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDateSeparator(timestamp: string): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /** Check if we should show a date separator before this message */
  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(this.messages()[index].timestamp).toDateString();
    const prevDate = new Date(this.messages()[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}

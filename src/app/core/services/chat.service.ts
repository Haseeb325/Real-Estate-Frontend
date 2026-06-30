import { inject, Injectable, signal, computed } from '@angular/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { AuthStore } from '../../shared/authStore';
import { ToastService } from './toast.service';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import {
  ChatSession,
  ChatMessage,
  ChatUser,
  WsIncomingMessage,
  WsOutgoingMessage,
} from '../models/chat.models';
import { environment } from '../../../environments/environment';

// ═══════════════════════════════════════════════════════════
// ChatService — Domain Orchestrator
//
// The ONLY service that UI components talk to.
// Orchestrates HTTP (Promises) + WebSocket (Observable).
//
// REST calls  → async/await (one-shot)
// WS stream   → Observable subscription (continuous)
// UI state    → Angular Signals (reactive)
// ═══════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class ChatService {
  // ── Dependencies ──
  private api = inject(ApiService);
  private ws = inject(WebSocketService);
  private authStore = inject(AuthStore);
  private toast = inject(ToastService);
  private notificationService = inject(NotificationService);

  // ── Signals (Components read these) ──
  readonly sessions = signal<ChatSession[]>([]);
  readonly activeSession = signal<ChatSession | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal(false);

  // ── Passthrough from WebSocketService ──
  readonly connectionStatus = this.ws.connectionStatus;

  // ── Current user details (to align message bubbles: left vs right) ──
  readonly currentUserId = computed(() => this.authStore.user()?.id);
  readonly currentUserUsername = computed(() => this.authStore.user()?.username);

  // ── The "other person" in the current active session ──
  readonly otherParticipant = computed(() => {
    const session = this.activeSession();
    const currentUsername = this.currentUserUsername();
    if (!session || !currentUsername) return null;

    // If I am the buyer, return the seller. If I am the seller, return the buyer.
    const isBuyer = session.buyer.username.toLowerCase() === currentUsername.toLowerCase();
    const other = isBuyer ? { ...session.seller } : { ...session.buyer };

    // If the API only returned a username string (id is 0), try to infer the real ID from messages
    if (!other.id || other.id === 0) {
      const msgs = this.messages();
      const msgFromOther = msgs.find(
        (m) => m.sender_username?.toLowerCase() === other.username.toLowerCase(),
      );
      if (msgFromOther && msgFromOther.sender) {
        other.id = typeof msgFromOther.sender === 'object' 
          ? (msgFromOther.sender as any).id 
          : msgFromOther.sender;
      }
    }

    return other;
  });

  // ── Internal ──
  private wsSubscription: Subscription | null = null;

  // ── API Base ──
  private readonly baseUrl = environment.apiBaseUrl + 'chat/';

  // ════════════════════════════════════════════
  // Normalization Helper
  // ════════════════════════════════════════════

  private normalizeSession(raw: any): ChatSession {
    const normUser = (u: any): ChatUser => {
      if (!u) return { id: 0, username: 'Unknown' };
      if (typeof u === 'string') return { id: 0, username: u };
      return {
        id: u.id ?? u.user_id ?? 0,
        username: u.username ?? '',
        full_name: u.full_name ?? u.name ?? '',
        profile_image: u.profile_image ?? null,
      };
    };

    return {
      session_id: raw.id || raw.session_id,
      buyer: normUser(raw.buyer),
      seller: normUser(raw.seller),
      property:
        typeof raw.property === 'string'
          ? { id: raw.property_id || raw.propertyId || 0, title: raw.property_title || raw.property || 'Property' }
          : typeof raw.property === 'number'
            ? { id: raw.property, title: raw.property_title || `Property ${raw.property}` }
            : raw.property || { id: raw.property_id || 0, title: raw.property_title || 'Property' },
      last_message: raw.last_message || null,
      last_message_time: raw.updated_at || raw.last_message_time || null,
      unread_count: raw.unread_count || 0,
      created_at: raw.created_at,
    };
  }

  // ════════════════════════════════════════════
  // REST: Load Sessions (Inbox List)
  // ════════════════════════════════════════════

  async loadSessions(): Promise<void> {
    this.isLoading.set(true);

    try {
      const response: any = await firstValueFrom(this.api.get(`${this.baseUrl}sessions/`));

      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to load sessions');
      }

      const normalizedSessions = response.data.map((raw: any) => this.normalizeSession(raw));
      
      // Fetch profile images for users who don't have them
      await this.enrichSessionsWithProfileImages(normalizedSessions);
      
      this.sessions.set(normalizedSessions);

      // Auto-select first session with unread messages, or the most recent one
      if (normalizedSessions.length > 0 && !this.activeSession()) {
        const unreadSession = normalizedSessions.find((s:any) => s.unread_count > 0);
        const sessionToSelect = unreadSession || normalizedSessions[0];
        this.selectSession(sessionToSelect);
      }
    } catch (error: any) {
      this.toast.error(error?.error?.message || 'Failed to load sessions');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async enrichSessionsWithProfileImages(sessions: ChatSession[]): Promise<void> {
    const userIds = new Set<number>();
    
    // Collect unique user IDs that need profile images
    sessions.forEach(session => {
      if (!session.buyer.profile_image && session.buyer.id > 0) {
        userIds.add(session.buyer.id);
      }
      if (!session.seller.profile_image && session.seller.id > 0) {
        userIds.add(session.seller.id);
      }
    });

    console.log('User IDs needing profile images:', Array.from(userIds));

    // Fetch profile images for each user
    for (const userId of userIds) {
      try {
        // Try different possible endpoints
        const endpoints = [
          `users/${userId}/`,
          `users/${userId}/profile/`,
          `profile/user/${userId}/`,
        ];

        let profileData = null;
        for (const endpoint of endpoints) {
          try {
            const response: any = await firstValueFrom(this.api.get(endpoint));
            console.log(`Response from ${endpoint}:`, response);
            if (response.status === 200) {
              profileData = response.data;
              break;
            }
          } catch (e) {
            console.log(`Endpoint ${endpoint} failed:`, e);
            continue;
          }
        }

        if (profileData) {
          const profileImage = profileData.profile_image || profileData.profileImage;
          console.log(`Found profile image for user ${userId}:`, profileImage);
          
          if (profileImage) {
            // Update sessions with the fetched profile image
            sessions.forEach(session => {
              if (session.buyer.id === userId) {
                session.buyer.profile_image = profileImage;
              }
              if (session.seller.id === userId) {
                session.seller.profile_image = profileImage;
              }
            });
          }
        }
      } catch (error) {
        // Silently fail if profile fetch fails - user will just show initial
        console.warn(`Failed to fetch profile for user ${userId}`, error);
      }
    }
  }

  // ════════════════════════════════════════════
  // REST: Create Session (Buyer initiates chat)
  // ════════════════════════════════════════════

  async createSession(propertyId: number, sellerId: number): Promise<ChatSession | null> {
    this.isLoading.set(true);

    try {
      const response: any = await firstValueFrom(
        this.api.post(`${this.baseUrl}sessions/`, {
          property: propertyId,
          seller: sellerId,
        }),
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.message || 'Failed to create session');
      }

      const newSession = this.normalizeSession(response.data);

      // Add to sessions list if not already there
      this.sessions.update((prev) => {
        const exists = prev.some((s) => s.session_id === newSession.session_id);
        return exists ? prev : [newSession, ...prev];
      });

      return newSession;
    } catch (error: any) {
      this.toast.error(error?.error?.message || 'Failed to create chat session');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ════════════════════════════════════════════
  // REST: Load Message History (one-time on session select)
  // ════════════════════════════════════════════

  private async loadMessages(sessionId: string): Promise<void> {
    this.isLoading.set(true);

    try {
      const response: any = await firstValueFrom(
        this.api.get(`${this.baseUrl}sessions/${sessionId}/messages/`),
      );

      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to load messages');
      }

      this.messages.set(response.data);
    } catch (error: any) {
      this.toast.error(error?.error?.message || 'Failed to load messages');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ════════════════════════════════════════════
  // REST: Mark Messages as Read
  // ════════════════════════════════════════════

  async markMessagesAsRead(sessionId: string, messageIds: string[]): Promise<void> {
    if (!messageIds || messageIds.length === 0) return;

    try {
      const response: any = await firstValueFrom(
        this.api.patch(`${this.baseUrl}sessions/${sessionId}/messages/read/`, {
          message_ids: messageIds,
        }),
      );

      if (response.status === 200) {
        // Update local state to reflect read status
        this.messages.update((prev) =>
          prev.map((msg) => (messageIds.includes(msg.id as any) ? { ...msg, is_read: true } : msg)),
        );
      }
    } catch (error: any) {
      console.error('[ChatService] Failed to mark messages as read:', error);
    }
  }

  // ════════════════════════════════════════════
  // Switch Active Session (Core Orchestration)

  // ════════════════════════════════════════════

  selectSession(session: ChatSession): void {
    // Skip if already selected
    if (this.activeSession()?.session_id === session.session_id) {
      return;
    }

    // 1. Clean up previous room
    this.cleanupCurrentRoom();

    // 2. Set new active session
    this.activeSession.set(session);
    this.messages.set([]); // Clear old messages

    // 3. Connect WebSocket to new room
    this.ws.connect(session.session_id);

    // 4. Subscribe to incoming WS messages (Observable — continuous stream)
    this.wsSubscription = this.ws.messages$.subscribe({
      next: (event: WsIncomingMessage) => this.onWsMessage(event),
      error: (err) => console.error('[ChatService] WS stream error:', err),
    });

    // 5. Load message history via REST (Promise — one-shot)
    this.loadMessages(session.session_id);
  }

  // ════════════════════════════════════════════
  // Send Message (WebSocket — NO HTTP)
  // ════════════════════════════════════════════

  sendMessage(text: string): void {
    if (!text.trim()) return;

    const payload: WsOutgoingMessage = { message: text.trim() };
    this.ws.send(payload);
  }

  // ════════════════════════════════════════════
  // Handle Incoming WebSocket Event
  // ════════════════════════════════════════════

  private onWsMessage(event: any): void {
    if (event.type === 'messages_read') {
      const readIds = event.message_ids as string[];
      if (readIds && readIds.length > 0) {
        this.messages.update((prev) =>
          prev.map((msg) => (readIds.includes(msg.id as any) ? { ...msg, is_read: true } : msg)),
        );
      }
      return;
    }

    // Convert WS event → ChatMessage shape
    const newMessage: ChatMessage = {
      id: event.message_id,
      session: this.activeSession()?.session_id || '',
      sender: event.sender_id,
      sender_username: event.sender_username,
      content: event.message,
      timestamp: event.timestamp,
      is_read: false,
    };

    // Append to messages signal (triggers UI re-render)
    this.messages.update((prev) => [...prev, newMessage]);

    // Play notification sound if message is from the OTHER person
    const currentId = this.authStore.user()?.id?.toString();
    const currentUsername = this.authStore.user()?.username?.toLowerCase();
    const senderId = event.sender_id?.toString();
    const senderUsername = event.sender_username?.toLowerCase();
    const isFromOther =               
      (currentId && senderId && currentId !== senderId) ||
      (currentUsername && senderUsername && currentUsername !== senderUsername);

    if (isFromOther) {
      this.notificationService.notify(
        event.sender_username || 'Someone',
        event.message || '(new message)',
      );
    }

    // Update last_message in session list (for inbox preview)
    this.sessions.update((sessions) =>
      sessions.map((s) =>
        s.session_id === this.activeSession()?.session_id
          ? { ...s, last_message: event.message, last_message_time: event.timestamp }
          : s,
      ),
    );
  }

  // ════════════════════════════════════════════
  // Cleanup
  // ════════════════════════════════════════════

  private cleanupCurrentRoom(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = null;
    }
    this.ws.disconnect();
  }

  /** Call this from component's ngOnDestroy */
  disconnectAll(): void {
    this.cleanupCurrentRoom();
    this.activeSession.set(null);
    this.messages.set([]);
  }
}

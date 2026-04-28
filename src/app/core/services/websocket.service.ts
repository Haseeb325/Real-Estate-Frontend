import { inject, Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthStore } from '../../shared/authStore';
import { environment } from '../../../environments/environment';

// ═══════════════════════════════════════════════════════════
// WebSocketService — Generic Infrastructure Layer
//
// Responsibility: Raw WebSocket lifecycle ONLY.
// Knows NOTHING about chat business logic.
//
// Features:
//   - connect(sessionId) with JWT token in URL
//   - send(data) as JSON
//   - disconnect() cleanly
//   - Auto-reconnect with exponential backoff (3 retries)
//   - messages$ Observable stream for incoming events
//   - connectionStatus Signal for UI binding
// ═══════════════════════════════════════════════════════════

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {

  private authStore = inject(AuthStore);

  // ── State ──
  readonly connectionStatus = signal<ConnectionStatus>('disconnected');

  // ── Stream ──
  private messagesSubject = new Subject<any>();
  readonly messages$: Observable<any> = this.messagesSubject.asObservable();

  // ── Internals ──
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private reconnectTimer: any = null;
  private currentSessionId: string | null = null;
  private intentionalClose = false;

  // ════════════════════════════════════════════
  // Connect
  // ════════════════════════════════════════════

  connect(sessionId: string): void {
    // Prevent duplicate connections to same session
    if (this.currentSessionId === sessionId && this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up any existing connection first
    this.disconnect();

    this.currentSessionId = sessionId;
    this.intentionalClose = false;
    this.connectionStatus.set('connecting');

    const token = this.authStore.token();
    if (!token) {
      console.error('[WebSocketService] No auth token available. Cannot connect.');
      this.connectionStatus.set('disconnected');
      return;
    }

    const url = `${environment.wsBaseUrl}chat/${sessionId}/?token=${token}`;

    try {
      this.socket = new WebSocket(url);
      this.wireSocketEvents();
    } catch (error) {
      console.error('[WebSocketService] Failed to create WebSocket:', error);
      this.connectionStatus.set('disconnected');
    }
  }

  // ════════════════════════════════════════════
  // Send
  // ════════════════════════════════════════════

  send(data: object): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketService] Cannot send — socket not open.');
      return;
    }
    this.socket.send(JSON.stringify(data));
  }

  // ════════════════════════════════════════════
  // Disconnect
  // ════════════════════════════════════════════

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.currentSessionId = null;
    this.connectionStatus.set('disconnected');
  }

  // ════════════════════════════════════════════
  // Internal: Wire native WebSocket events
  // ════════════════════════════════════════════

  private wireSocketEvents(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('[WebSocketService] ✅ Connected to:', this.currentSessionId);
      this.connectionStatus.set('connected');
      this.reconnectAttempts = 0; // Reset on successful connection
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.messagesSubject.next(data);
      } catch (error) {
        console.error('[WebSocketService] Failed to parse message:', error);
      }
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log('[WebSocketService] ❌ Disconnected. Code:', event.code);

      if (!this.intentionalClose) {
        // Unexpected disconnect — attempt reconnect
        this.attemptReconnect();
      } else {
        this.connectionStatus.set('disconnected');
      }
    };

    this.socket.onerror = (error: Event) => {
      console.error('[WebSocketService] Socket error:', error);
      // onclose will fire after onerror — reconnect logic handled there
    };
  }

  // ════════════════════════════════════════════
  // Auto-Reconnect (Exponential Backoff)
  // Retry 1: 1s, Retry 2: 2s, Retry 3: 4s
  // ════════════════════════════════════════════

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocketService] Max reconnect attempts reached. Giving up.');
      this.connectionStatus.set('disconnected');
      return;
    }

    this.connectionStatus.set('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.pow(2, this.reconnectAttempts - 1) * 1000; // 1s, 2s, 4s
    console.log(`[WebSocketService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.currentSessionId) {
        this.connect(this.currentSessionId);
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ════════════════════════════════════════════
  // Cleanup
  // ════════════════════════════════════════════

  ngOnDestroy(): void {
    this.disconnect();
    this.messagesSubject.complete();
  }
}

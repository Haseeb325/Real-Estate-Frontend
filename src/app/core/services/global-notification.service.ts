import { inject, Injectable, signal, OnDestroy } from '@angular/core';
import { AuthStore } from '../../shared/authStore';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

export interface PresenceInfo {
  isOnline: boolean;
  lastSeen: string | null; // ISO string
}

// ═══════════════════════════════════════════════════════════
// GlobalNotificationService
//
// Maintains a PERSISTENT WebSocket connection to ws/notifications/
// regardless of which screen the user is on.
//
// Handles two event types from the backend:
//   - new_message   → plays beep + browser notification
//   - presence_update → updates presenceMap signal
// ═══════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class GlobalNotificationService implements OnDestroy {
  private authStore = inject(AuthStore);
  private notificationService = inject(NotificationService);

  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  // Tab coordination
  private broadcastChannel: BroadcastChannel | null = null;
  private tabId: string = this.generateTabId();
  private isMasterTab = false;
  private heartbeatInterval: any = null;

  /** userId → presence info. Components read this signal to show online/offline. */
  readonly presenceMap = signal<Record<string, PresenceInfo>>({});
  /** username → presence info. Used as fallback if ID is missing. */
  readonly usernamePresenceMap = signal<Record<string, PresenceInfo>>({});

  /** Call this once after successful login */
  connect(): void {
    const token = this.authStore.token();
    if (!token) return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    
    // Always connect initially, then coordinate with other tabs
    this._doConnect(token);
    this.setupTabCoordination();
  }

  /** Call this on logout */
  disconnect(): void {
    this.intentionalClose = true;
    this.clearTimer();
    this.cleanupTabCoordination();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.presenceMap.set({});
  }

  /** Get presence for a specific user id or username */
  getPresence(identifier: string | number | undefined): PresenceInfo {
    if (!identifier) return { isOnline: false, lastSeen: null };
    const idStr = identifier.toString();
    const byId = this.presenceMap()[idStr];
    if (byId) return byId;
    const byUsername = this.usernamePresenceMap()[idStr.toLowerCase()];
    if (byUsername) return byUsername;
    return { isOnline: false, lastSeen: null };
  }

  private _doConnect(token: string): void {
    const url = `${environment.wsBaseUrl}notifications/?token=${token}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('[GlobalNotification] ✅ Notification WS connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event_type === 'new_message') {
          this.notificationService.notify(
            data.sender_username || 'Someone',
            data.message || '(new message)',
          );
          return;
        }

        if (data.event_type === 'presence_update') {
          const userId = data.user_id?.toString();
          const username = data.username?.toLowerCase();
          
          const newPresence = {
            isOnline: data.is_online,
            lastSeen: data.last_seen ?? null,
          };

          if (userId) {
            this.presenceMap.update((prev) => ({
              ...prev,
              [userId]: newPresence,
            }));
          }
          if (username) {
            this.usernamePresenceMap.update((prev) => ({
              ...prev,
              [username]: newPresence,
            }));
          }
          
          // Broadcast presence update to other tabs if we're master
          this.broadcastPresenceUpdate();
          return;
        }
      } catch (e) {
        // Ignore malformed events
      }
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log('[GlobalNotification] ❌ Disconnected. Code:', event.code);
      if (!this.intentionalClose) {
        this._scheduleReconnect();
      }
    };

    this.socket.onerror = () => {
      // onclose fires after onerror — reconnect handled there
    };
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      const token = this.authStore.token();
      if (token) this._doConnect(token);
    }, delay);
  }

  private clearTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Tab Coordination - Prevent duplicate WebSocket connections
  // ═══════════════════════════════════════════════════════════

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupTabCoordination(): void {
    try {
      this.broadcastChannel = new BroadcastChannel('presence_coordination');
      
      this.broadcastChannel.onmessage = (event) => {
        const { type, tabId, data } = event.data;
        
        if (type === 'heartbeat') {
          // Another tab is alive, check if we should become master
          this.checkMasterElection();
        } else if (type === 'presence_update') {
          // Sync presence from master tab
          if (data) {
            this.presenceMap.set(data.presenceMap);
            this.usernamePresenceMap.set(data.usernamePresenceMap);
          }
        }
      };

      // Announce our presence
      this.broadcastChannel.postMessage({ type: 'heartbeat', tabId: this.tabId });
      
      // Start heartbeat to announce we're alive
      this.heartbeatInterval = setInterval(() => {
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({ type: 'heartbeat', tabId: this.tabId });
        }
        this.checkMasterElection();
      }, 2000);

      // Initial master election
      this.checkMasterElection();

    } catch (error) {
      console.warn('[GlobalNotification] BroadcastChannel not supported, using fallback');
    }
  }

  private cleanupTabCoordination(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'tab_closing', tabId: this.tabId });
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    this.isMasterTab = false;
  }

  private checkMasterElection(): void {
    // Simplified: All tabs maintain WebSocket connections
    // Master election only used for coordinating presence broadcasts to avoid duplicates
    const masterTabId = localStorage.getItem('presence_master_tab');
    const masterTimestamp = parseInt(localStorage.getItem('presence_master_timestamp') || '0');
    const now = Date.now();
    
    // If no master or master is stale (> 5 seconds), become master
    if (!masterTabId || (now - masterTimestamp > 5000)) {
      localStorage.setItem('presence_master_tab', this.tabId);
      localStorage.setItem('presence_master_timestamp', now.toString());
      this.isMasterTab = true;
      console.log('[GlobalNotification] This tab is now master for presence broadcasts');
    } else if (masterTabId === this.tabId) {
      // We are already master, update timestamp
      localStorage.setItem('presence_master_timestamp', now.toString());
      this.isMasterTab = true;
    } else {
      // Another tab is master, we are slave
      this.isMasterTab = false;
      console.log('[GlobalNotification] This tab is slave for presence broadcasts');
    }
    
    // Ensure we have a connection regardless of master/slave status
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      const token = this.authStore.token();
      if (token) {
        this._doConnect(token);
      }
    }
  }

  private broadcastPresenceUpdate(): void {
    if (this.isMasterTab && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'presence_update',
        tabId: this.tabId,
        data: {
          presenceMap: this.presenceMap(),
          usernamePresenceMap: this.usernamePresenceMap()
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanupTabCoordination();
  }
}

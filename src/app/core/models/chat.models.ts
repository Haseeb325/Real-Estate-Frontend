// ═══════════════════════════════════════════════════════════
// Chat Models — Interfaces Only (no classes needed)
// Chat data is simple, read-only, and high-frequency.
// ═══════════════════════════════════════════════════════════

// ── Nested Types ──────────────────────────────────────────

export interface ChatUser {
  id: number;
  username: string;
  full_name?: string;
  profile_image?: string;
}

export interface ChatProperty {
  id: number;
  title: string;
  thumbnail?: string;
}

// ── Session (Inbox Item) ─────────────────────────────────

export interface ChatSession {
  session_id: string;
  buyer: ChatUser;
  seller: ChatUser;
  property: ChatProperty;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  created_at: string;
}

// ── Message (Single Chat Bubble) ─────────────────────────

export interface ChatMessage {
  id: number;
  session: string; // session_id reference
  sender: number; // user ID
  sender_username: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

// ── WebSocket Events ─────────────────────────────────────

/** Shape of data RECEIVED from the WebSocket */
export interface WsIncomingMessage {
  type: 'chat_message';
  message: string;
  sender_id: number;
  sender_username: string;
  timestamp: string;
  message_id: number;
}

/** Shape of data SENT through the WebSocket */
export interface WsOutgoingMessage {
  message: string;
}

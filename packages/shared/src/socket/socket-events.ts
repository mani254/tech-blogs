// ─── Socket.IO Event Constants & Payload Types ────────────────────────────────
//
// Shared between backend (NestJS) and frontend (React/Vue/etc.).
// Import only types from this file — no runtime side effects.

// ─── Presence & General Events ────────────────────────────────────────────────

export const WS_EVENTS = {
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE_PING: 'presence:ping',
  PRESENCE_PONG: 'presence:pong',
  PRESENCE_GET_ONLINE: 'presence:get_online',
  PRESENCE_ONLINE_LIST: 'presence:online_list',

  // Errors
  WS_ERROR: 'error',
} as const;

// ─── Server → Client Payloads ─────────────────────────────────────────────────

export interface WsPresencePayload {
  userId: string;
  name: string;
  email: string;
  timestamp: string;
}

export interface WsOfflinePayload {
  userId: string;
  email: string;
  timestamp: string;
}

export interface WsOnlineListPayload {
  onlineUserIds: string[];
}

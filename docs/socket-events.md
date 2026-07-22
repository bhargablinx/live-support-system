# Socket.IO Event Protocol — ELS

All real-time communication flows through the Socket.IO server at `http://localhost:8000`. Authentication is enforced in the connection middleware: the server resolves each socket to either an `Agent` (via `accessToken` JWT cookie) or a `Visitor` (via `visitorToken` in `socket.auth`).

---

## Rooms

| Room | Members | Purpose |
|---|---|---|
| `org_<organizationId>` | All connected agents + visitors of an org | Org-wide broadcasts (ticket events, presence) |
| `<conversationId>` | Agents and visitor who explicitly join | Isolated chat room |

---

## Client → Server Events

| Event | Payload | Notes |
|---|---|---|
| `join_room` | `{ conversationId: string }` | Called after connect. Server calls `socket.join(conversationId)` and acks with `room_joined`. |
| `send_message` | `{ conversationId: string, content: string }` | Server persists to DB, then broadcasts to the conversation room and `org_<id>`. |
| `type_start` | `{ conversationId: string }` | Declares typing started. Server sets a Redis key `conversation:<id>:typing:<actorId>` with a 5s TTL, then broadcasts `typing_start` to room peers. |
| `type_stop` | `{ conversationId: string }` | Declares typing stopped. Server deletes the Redis typing key, then broadcasts `typing_stop` to room peers. |

---

## Server → Client Events

### Chat Events

| Event | Payload | Target | Notes |
|---|---|---|---|
| `receive_message` | `{ id, conversationId, content, senderType, createdAt }` | Conversation room + sender socket | Broadcast after DB persist. Sender **also** receives its own message back (with the real DB-generated `id` and `createdAt`). |
| `room_joined` | `{ conversationId }` | Sender socket only | Ack for `join_room`. |

### Org-wide Broadcast Events

These are emitted to the `org_<organizationId>` room so all active agent dashboards stay in sync.

| Event | Payload | Notes |
|---|---|---|
| `org_message` | `{ conversationId: string, message: Message }` | New message arrived; agents use this to update conversation list order and timestamps. |
| `conversation_claimed` | `Conversation` (full Prisma object with visitor + assignedUser) | Also emitted to the conversation room. |
| `conversation_resolved` | `Conversation` (full Prisma object with visitor + assignedUser) | Also emitted to the conversation room. Widget locks input. |
| `conversation_archived` | `Conversation` (full Prisma object with visitor + assignedUser) | Also emitted to the conversation room. Widget locks input. |
| `conversation_reopened` | `Conversation` (full Prisma object with visitor + assignedUser) | Also emitted to the conversation room. Widget unlocks input. |
| `conversation_deleted` | `{ id: string }` | ADMIN-only action. Only org room (no conversation room — room is being torn down). |

### Presence Events

| Event | Payload | Target | Notes |
|---|---|---|---|
| `visitor_online` | `{ visitorId: string }` | `org_<id>` | Emitted on visitor socket connect. |
| `visitor_offline` | `{ visitorId: string }` | `org_<id>` | Emitted when visitor's **last** socket disconnects (multi-tab aware). |

### Typing Indicator Events

| Event | Payload | Target | Notes |
|---|---|---|---|
| `typing_start` | `{ actorId: string, actorType: "visitor" \| "agent", conversationId: string }` | Conversation room (excluding sender) | Dashboard filters for `actorType === "visitor"` only. |
| `typing_stop` | `{ actorId: string, conversationId: string }` | Conversation room (excluding sender) | Dashboard auto-clears after 5s as a safety net to match backend TTL. |

---

## Design Decisions

- **Room naming**: `conversationId` directly as the room name; `org_<organizationId>` for organization-wide channels.
- **Auth on connect**: JWT cookie (agent) or `socket.auth.visitorToken` (visitor) verified in connection middleware before any room join is allowed.
- **Persist before broadcast**: Messages are written to PostgreSQL first, then the DB-generated `id` and `createdAt` are broadcast — preventing phantom messages from appearing in the chat.
- **Sender echo**: `receive_message` is sent to both `socket.to(conversationId)` (peers) and `socket.emit(...)` (sender), so the widget/dashboard can replace optimistic UI with the real persisted message.
- **Multi-tab presence**: `visitor_offline` is only emitted when the visitor's `userSockets` Redis Set becomes empty after unregistering the disconnected socket. This prevents flickering online/offline states when a visitor has multiple tabs open.

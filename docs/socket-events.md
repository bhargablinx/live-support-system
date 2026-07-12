## Client → Server

| Event          | Payload                                                                         | Notes                                                                   |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `join_room`    | `{ conversationId: string }`                                                    | Called right after connect. Server calls `socket.join(conversationId)`. |
| `send_message` | `{ conversationId: string, content: string, senderType: 'visitor' \| 'agent' }` | Server persists to DB, then broadcasts.                                 |

## Server → Client

| Event             | Payload                                                  | Notes                                                                                                                                             |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `receive_message` | `{ id, conversationId, content, senderType, createdAt }` | Broadcast to everyone in the room _except_ the sender (use `socket.to(room).emit(...)`, not `io.to(room).emit(...)`, or the sender gets an echo). |
| `room_joined`     | `{ conversationId }`                                     | Optional ack so the client knows the join succeeded before it starts sending.                                                                     |

## Design notes worth deciding now

- **Room naming**: `conversationId` directly as the room name
- **Auth on connect**: passing the JWT (agent) or visitor token in the `socket.io` handshake `auth` field, verify it in a connection middleware before allowing any `join_room` call. Not trusting a bare `conversationId` from an unauthenticated socket.
- **Persist before broadcast**: Entry the message to Postgres, then emit with the real DB-generated `id` and `createdAt`
- **Idempotency**: if you add optimistic UI on the client (message appears before server ack), give each outgoing message a client-generated `tempId` so you can reconcile it with the real message once `receive_message` comes back.

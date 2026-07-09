# Enterprise Live Support System

ELS is a multi tenant live support chat platform and shared team inbox designed to simulate enterprise-scale customer support. It bridges the gap between anonymous end users requiring realtime support and internal agent teams managing incoming tickets via an event driven architecture.

## Architecture Blueprint

Instead of relying on standard HTTP poll loops, ELS leverages a high throughput, bidirectional event matrix. The system is split into two completely decoupled frontends powered by a single optimized, stateless backend.

![alt text](./docs/infographics.png)

## Core Highlights & Business Workflows

- **Persistent Guest Sessions:** An embeddable React customer widget that utilizes cryptographic tracking tokens stored in `localStorage`. If a customer closes their tab, drops their connection, or refreshes the page, their full historical conversation state is securely hydrated upon reconnection.
- **Dynamic Shared Inbox (The Queue):** An enterprise-style ticket routing dashboard for support agents. Conversations transition in real-time across isolated structural queues: `Unassigned` -> `Assigned to Me` -> `Resolved`.
- **Atomic Ticket Claiming:** When an agent claims a ticket, the operation is handled atomically. The system moves the agent into the customer's dedicated WebSocket room, updates PostgreSQL, and emits a broadcast event to instantly purge that conversation from all other active agents' unassigned columns.

## Technical

- **Redis-Backed Presence & State Resiliency:** The Node.js layer will be designed to be completely stateless. Active socket connections, agent online/offline statuses, and user mappings are cached in **Redis** with a strict Time-to-Live (TTL). If a server crashes or restarts, the ecosystem self-heals without losing persistent chat context or session ownership.
- **Isolated Socket Room Segregation:** To optimize network traffic and security, messages will never broadcast globally. Active conversations are siloed into cryptographic virtual rooms (`socket.join(conversationId)`), keeping the network footprint highly efficient.
- **Low-Overhead Micro-Events:** Features like real-time typing indicators (`chat:typing`) and read receipts skip the database completely. They are debounced on the client and piped as ultra-lightweight binary payloads directly across WebSockets to preserve database performance.

## Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS, Shadcn/UI
- **Backend:** Node.js, Express.js, Socket.io
- **Infrastructure & Caching:** Redis (Session Store & Pub/Sub), PostgreSQL (Prisma ORM)

# Enterprise Live Support (ELS) - Backend Server

[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

The backend service for the **Enterprise Live Support System (ELS)**. It provides a stateless REST API, real-time WebSocket communication powered by Socket.IO and Redis Streams, multi-tenant row-level authorization via Prisma ORM, distributed actor mapping, and media upload management.

---

## 🏗️ Architecture & Core Components

- **Express REST API**: Routes for authentication, tenant organization administration, agent user management, customer visitors, conversations, real-time analytics, and Cloudinary file uploads.
- **Socket.IO Real-time Engine**: Bidirectional event matrix supporting organization-wide channels (`org_${organizationId}`) and room-segregated chat threads (`conversationId`).
- **Redis Infrastructure**:
  - **Horizontal Scaling**: Uses `@socket.io/redis-streams-adapter` to fan out socket events across multiple Node.js instances.
  - **Presence Tracking (`presence.service.ts`)**: 60-second TTL online flags and live typing indicators.
  - **Distributed Socket Map (`socket-map.service.ts`)**: Multi-tab-aware lookup mapping socket IDs to identity tuples (`type`, `actorId`, `organizationId`).
  - **Key Factory (`redis.key.gen.ts`)**: Type-safe centralized key namespace.
- **PostgreSQL & Prisma ORM**: Multi-tenant relational schema outputting to `server/src/generated/prisma`.

---

## 📁 Folder Structure

```
server/
├── prisma/
│   └── schema.prisma           # Database schema & multi-tenant entity models
├── src/
│   ├── controllers/            # Route controllers (auth, conversation, visitor, etc.)
│   ├── middleware/             # Auth (verifyJwt, authorizeRole) & error handling
│   ├── redis/                  # Redis clients, key factory, presence & socket-map
│   ├── routes/                 # Express API router definitions
│   ├── socket/                 # Socket.IO connection, room & auth handlers
│   ├── types/                  # Express & TypeScript type augmentations
│   └── utils/                  # ApiError, ApiResponse, asyncHandler, Cloudinary SDK
├── docker-compose.yml          # Redis container configuration
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/els_db?schema=public"

# Auth JWT Tokens
ACCESS_TOKEN_SECRET="your-access-token-secret"
ACCESS_TOKEN_EXPIRY="1d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRY="15d"

# Redis Cache & Adapter
REDIS_URL="redis://localhost:6379"

# Media Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 🚀 Quick Start

### 1. Start Redis
```bash
docker compose up -d
```

### 2. Configure Database & Run Migrations
```bash
npx prisma generate
npx prisma db push   # or: npx prisma migrate dev
```

### 3. Run Development Server
```bash
npm run dev
# Server running at http://localhost:8000
```

---

## 📡 REST API Summary

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | POST | Public | Register new org + admin user |
| `/api/v1/auth/login` | POST | Public | Authenticate user & issue HttpOnly JWT cookies |
| `/api/v1/auth/logout` | POST | JWT | Logout and invalidate session |
| `/api/v1/auth/me` | GET | JWT | Current user & org session |
| `/api/v1/visitor` | POST | Public | Register visitor profile and issue `visitorToken` |
| `/api/v1/conversation` | POST | Public | Create new conversation thread |
| `/api/v1/conversation` | GET | JWT | List organization conversations |
| `/api/v1/conversation/:id/claim` | POST | JWT | Claim conversation queue item |
| `/api/v1/conversation/:id/resolve` | POST | JWT | Resolve conversation |
| `/api/v1/conversation/:id/archive` | POST | JWT | Archive conversation |
| `/api/v1/conversation/:id/reopen` | POST | JWT | Reopen resolved/archived conversation |
| `/api/v1/conversation/:id` | DELETE | ADMIN | Hard delete conversation and messages |
| `/api/v1/agents` | GET | JWT | List agents & online status |
| `/api/v1/analytics` | GET | JWT | Metrics (FRT, resolution rate, traffic charts) |
| `/api/v1/upload` | POST | JWT/Visitor | Upload chat file attachment to Cloudinary |

---

## 🔌 Socket.IO Events

### Client ➔ Server
- `join_room` (`{ conversationId }`): Join conversation channel.
- `send_message` (`{ conversationId, content, attachments }`): Send chat message.
- `type_start` (`{ conversationId }`): Broadcast typing indicator.
- `type_stop` (`{ conversationId }`): Clear typing indicator.

### Server ➔ Client
- `receive_message`: Emitted to conversation room on new message.
- `org_message`: Emitted to `org_${organizationId}` to update ticket lists.
- `conversation_claimed`, `conversation_resolved`, `conversation_archived`, `conversation_reopened`, `conversation_deleted`: Real-time queue state transitions.
- `typing_start`, `typing_stop`: Real-time peer typing notifications.
- `visitor_online`, `visitor_offline`: Presence broadcasts to org.

---

## 🛠️ Build & Scripts

- `npm run dev`: Run server in development mode using `tsx`.
- `npm run build`: Compile TypeScript down to `dist/`.
- `npm run start`: Start production server from `dist/`.

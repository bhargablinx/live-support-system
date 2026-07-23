# Enterprise Live Support (ELS) Project Status

This document provides a comprehensive map of all functional modules, architectural components, and technical features in the **Enterprise Live Support System (ELS)** workspace. It serves as a single source of truth for the current development progress, detailing what has been implemented, what is partially complete, and what remains in the backlog.

---

## 🚀 System Architecture Overview

The system is built as a multi-package monorepo consisting of:
1. **[Customer Widget](file:///home/bhargab/WebD/live-support-system/widget)**: A Vite-React floating chat app embeddable on guest client websites.
2. **[Agent Dashboard](file:///home/bhargab/WebD/live-support-system/agent-dashboard)**: A Next.js (App Router) admin dashboard for support agents and team leads.
3. **[Express Backend](file:///home/bhargab/WebD/live-support-system/server)**: An Express + Socket.IO REST & WS server interacting with PostgreSQL via Prisma ORM and caching/scaling with Redis.

---

## 📊 Feature Status Matrix

| Module | Sub-Feature / Functionality | Status | Target Package / Files | Description |
| :--- | :--- | :---: | :--- | :--- |
| **Authentication & AuthZ** | JWT Access & Refresh Tokens | 🟢 Complete | `server/src/controllers/auth.controller.ts` | Cookie-based access tokens; refresh tokens with Redis fallback |
| | Multi-Tenant Org Sign-up | 🟢 Complete | `server/src/routes/auth.route.ts` | Allows organization registration + admin account setup |
| | Role-Based Access Control | 🟢 Complete | `server/src/middleware/auth.middleware.ts` | `ADMIN` and `AGENT` route permissions |
| **Real-time Engine** | WebSocket Infrastructure | 🟢 Complete | `server/src/socket/index.ts` | Bidirectional sync via Socket.IO |
| | Horizontal Scaling | 🟢 Complete | `server/src/socket/index.ts` | Redis Streams adapter (`@socket.io/redis-streams-adapter`) |
| | Room Segregation Strategy | 🟢 Complete | `server/src/socket/index.ts` | Org-level (`org_ID`) and conversation-level rooms |
| | Automatic Rejoin Hook | 🟢 Complete | `agent-dashboard/hooks/use-dashboard-socket.ts` | Re-emits `join_room` for the selected chat on reconnection |
| **Presence System** | Active Heartbeats | 🟢 Complete | `server/src/redis/presence.service.ts` | Client keeps presence alive in Redis via 30s heartbeats |
| | Multi-Tab/Device Sync | 🟢 Complete | `server/src/redis/socket-map.service.ts` | Visitor/Agent is marked offline only when all sockets disconnect |
| | Live Typing Indicators | 🟢 Complete | `server/src/redis/presence.service.ts` | TTL-based (5s) typing state broadcasted to chat room |
| **Ticket Lifecycle** | Claiming Queue | 🟢 Complete | `server/src/controllers/conversation.controller.ts` | Move conversation from `UNASSIGNED` to `CLAIMED` and assign agent |
| | Resolution & Archive | 🟢 Complete | `server/src/controllers/conversation.controller.ts` | Sets status to `RESOLVED` / `ARCHIVED`, locking customer inputs |
| | Ticket Re-opening | 🟢 Complete | `server/src/controllers/conversation.controller.ts` | Restores conversation status and unlocks client UI |
| | Admin-Only Deletion | 🟢 Complete | `server/src/controllers/conversation.controller.ts` | Hard-deletes messages & tickets from DB; updates all agent screens |
| **Customer Widget** | Guest Session Persistence | 🟢 Complete | `widget/src/App.tsx` | Stores unique visitor token in LocalStorage to sustain sessions |
| | Real-time Chat UI | 🟢 Complete | `widget/src/components/chat/ChatPage.tsx` | Responsive chat window with message bubble feed and inputs |
| **Agent Dashboard** | Conversation Feeds | 🟢 Complete | `agent-dashboard/components/dashboard/conversation-list.tsx` | Split into queues: Unassigned, Mine (Assigned to Me), and Closed |
| | Customer Profiles | 🟢 Complete | `agent-dashboard/components/dashboard/customer-details.tsx` | Displays visitor metadata: Location, Browser, OS, current URL |
| | Canned Responses | 🟡 Partial | `agent-dashboard/components/dashboard/chat-window.tsx` | Hardcoded shortcuts (`/hi`, `/thanks`, etc.) in frontend UI |
| | Analytics Insights | 🟢 Complete | `agent-dashboard/app/dashboard/analytics/page.tsx` | KPI cards, traffic charts, response time trends via Recharts |
| | User/Agent Management | 🟢 Complete | `agent-dashboard/app/dashboard/agents/page.tsx` | Admins can view agents, create new agent roles, and delete users |
| | Settings Panel | 🟢 Complete | `agent-dashboard/app/dashboard/settings/page.tsx` | Admins can update organization profile details |
| **Widget Customizer** | UI Design Configuration | 🔴 Planned | `agent-dashboard/app/dashboard/widget/page.tsx` | Custom widget colors, welcome text, and button settings (Under Construction) |
| **AI Assistant** | Smart Suggested Replies | 🔴 Planned | *Not Implemented* | Contextual response recommendations powered by AI |
| | Ticket Summarization | 🔴 Planned | *Not Implemented* | AI-generated summary of chat history for claimed tickets |
| | Auto Sentiment/Tagging | 🔴 Planned | *Not Implemented* | Automated conversation tagging and sentiment analysis |
| **Media Attachments** | File Upload System | 🔴 Planned | *Not Implemented* | Support for sending images, PDFs, or files in the chat thread |

> **Status Legend**:
> - 🟢 **Complete**: Fully developed, integrated with database/Redis, and deployed in development.
> - 🟡 **Partial**: Partially built (e.g. mock data or UI-only without server-side persistence).
> - 🔴 **Planned**: Backlogged feature or page currently under construction.

---

## 🛠️ Detailed Functional Modules Breakdown

### 1. Multi-Tenant Tenancy Guard
Every tenant's resources are isolated at the schema level using row-level identifiers.
*   **Database Schema**: Embedded `organizationId` on `User`, `Visitor`, `Conversation`.
*   **Controller Level**: The JWT middleware sets `req.user.organizationId` which is forced into the `where` clause of every Prisma command:
    ```typescript
    const conversations = await prisma.conversation.findMany({
        where: { organizationId }
    });
    ```
*   **Data Leak Protection**: Queries targeting external resources throw a `404 Not Found` (rather than a `403 Forbidden`) to prevent revealing the existence of resources in other tenant environments.

### 2. Session & Auth Pipeline
*   **Agent Auth**: Logins use bcrypt hashes on password and issue cookie-based HttpOnly JWT tokens.
*   **Visitor Auth**: The widget makes a handshake call to register a guest profile. It returns a cryptographic `visitorToken` stored on the client.
*   **Session Initialization**: Handled on layout mount by [redux-provider.tsx](file:///home/bhargab/WebD/live-support-system/agent-dashboard/components/providers/redux-provider.tsx) checking current cookies and caching agent info in Redux store.

### 3. Real-time Synchronization
A central Redis Streams instance fans out WebSockets messaging to support horizontal scale:
*   `join_room`: Links client connection to dedicated conversation rooms.
*   `send_message`: Persists message into PostgreSQL then forwards `receive_message` to room members and `org_message` to all agents to update timestamps on sidebars.
*   `conversation_claimed` / `conversation_resolved` / `conversation_archived`: Direct state transitions that move the chat card across lists instantly on all admin browsers.

### 4. Redis Presence Service
High-performance presence manager implemented in [presence.service.ts](file:///home/bhargab/WebD/live-support-system/server/src/redis/presence.service.ts):
*   **Heartbeat Loop**: Active clients ping `/presence/heartbeat` or emit WS heartbeats every 30s. Keys auto-expire after 60s in Redis if a connection terminates abruptly.
*   **Multi-Tab Tracking**: Maps active sockets via a Redis Set (`socket:sockets:actorId`). A user is only offline when the set length becomes `0` on disconnect.

### 5. Management & Admin Dashboards
*   **Agent Management**: Administrators can CRUD agent users, track active count, and delete agent memberships.
*   **Analytics Platform**: Real-time aggregation of support metrics:
    *   **Average First Response Time (FRT)**: Time from conversation creation to first agent-sent message.
    *   **Average Resolution Time (RT)**: Time from creation to ticket status change to `RESOLVED` or `ARCHIVED`.
    *   **Volume & Traffic Charts**: Plotted using Recharts showing chat traffic by hour of day and weekly volume trends.

---

## 🔮 Backlog & Roadmap

The following modules represent the next stages of product development:

### 1. AI Assistant Engine
*   **Suggested Replies**: Implement an LLM pipeline to analyze the last 5 messages in a conversation and suggest canned responses or drafts to the agent.
*   **Conversation Summarizer**: Summarize active or reopened tickets to help agents catch up on visitor history instantly.
*   **Sentiment & Tagging**: Automatically evaluate customer sentiment and attach classification tags (e.g. `Billing`, `Bug`, `General Inquiry`).

### 2. Canned Responses Server Integration
*   Currently, canned responses are hardcoded in the frontend.
*   **Proposed Improvement**: Add a `CannedResponse` model in PostgreSQL, exposing CRUD APIs so administrators can customize shortcuts at the organization level.

### 3. S3 File Upload / Attachments
*   Add multi-part form support using Multer on the server.
*   Provide secure file uploads to an AWS S3 bucket or compatible storage.
*   Update the database schema with an `Attachment` entity linked to `Message`.

### 4. Customer Widget Builder
*   Provide a UI builder inside the Agent Dashboard where admins can preview changes to the widget widget (colors, titles, default greeting messages) and update settings persisted on the server.

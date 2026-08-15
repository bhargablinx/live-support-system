# Enterprise Live Support (ELS) - Agent Dashboard

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white)](https://recharts.org/)

The enterprise admin and agent workspace for the **Enterprise Live Support System (ELS)**. Built with Next.js App Router, Redux Toolkit, Socket.IO, Tailwind CSS, and Recharts.

---

## ✨ Key Features

- **Multi-Tenant Inbox Queues**: Shared inbox split into real-time queues: `Unassigned`, `Mine` (Assigned to Me), and `Closed`.
- **Atomic Ticket Routing**: Claim incoming tickets instantly. Broadcast events remove tickets from other agents' unassigned columns in real-time.
- **Customer Metadata Panel**: Sidebar displaying visitor profile data (browser, OS, location, current webpage URL) and agent internal notes.
- **Canned Responses & Quick Actions**: Keyboard shortcuts (`/hi`, `/thanks`, `/pricing`) for fast customer replies.
- **Real-Time Analytics Platform**: Dashboard displaying KPIs including First Response Time (FRT), Resolution Time (RT), total volume, and interactive hourly/weekly volume charts using Recharts.
- **User & Organization Management**: Admin pages to manage team members, assign agent roles, update organization settings, and configure tenant options.
- **Resilient WebSockets Hook (`useDashboardSocket`)**: Automatically rejoins selected conversation rooms after network reconnects.

---

## 📁 Directory Structure

```
agent-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx               # Main ticket queue & chat workspace
│   │   ├── analytics/page.tsx     # Real-time support analytics & charts
│   │   ├── agents/page.tsx        # User management & agent roster
│   │   ├── settings/page.tsx      # Organization settings
│   │   └── widget/page.tsx        # Custom widget configuration (builder)
│   ├── login/page.tsx             # Agent login page
│   └── register/page.tsx          # Organization registration page
├── components/
│   ├── dashboard/                 # Conversation list, chat window, customer details
│   ├── providers/                 # Redux & Auth initializer providers
│   └── ui/                        # Reusable shadcn/ui components
├── hooks/
│   └── use-dashboard-socket.ts    # Custom WebSockets hook
├── lib/
│   ├── api/                       # Axios API client functions
│   └── store/                     # Redux store & slices
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `agent-dashboard/` directory:

```env
# Proxies server-side Next.js /api/* endpoints to the Express server
API_BASE_URL=http://127.0.0.1:8000/api/v1

# Points client-side axios requests to the Next.js proxy route
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
# Dashboard available at http://localhost:3000
```

---

## 🛠️ Build & Scripts

- `npm run dev`: Start Next.js development server.
- `npm run build`: Compile Next.js production build.
- `npm run start`: Launch production Next.js server.
- `npm run lint`: Run ESLint checks.

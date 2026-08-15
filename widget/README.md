# Enterprise Live Support (ELS) - Customer Chat Widget

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

The guest-facing, embeddable floating support chat widget for the **Enterprise Live Support System (ELS)**.

---

## ✨ Features

- **Persistent Visitor Sessions**: Automatically registers guest visitors and stores a cryptographic `visitorToken` in `localStorage`. Chat threads persist seamlessly across page refreshes, tab closures, and reconnects.
- **Real-time Chat Matrix**: Bidirectional WebSockets via Socket.IO client for sub-second messaging, room joining, and live responses.
- **Cloudinary File Attachments**: Image preview and document attachment support directly inside the chat feed.
- **Typing Indicators**: Shows when support agents are typing back.
- **Resolved / Archived State Locking**: Automatically locks chat input and displays system status banners when a ticket is resolved or archived by an agent.
- **Responsive Floating UI**: Built with Tailwind CSS and Radix/shadcn components for smooth animations and high-contrast accessibility.

---

## 📁 Directory Layout

```
widget/
├── src/
│   ├── components/
│   │   ├── chat/           # Chat window, message feed, and chat input controls
│   │   └── ui/             # Reusable UI primitives (buttons, dialogs, scroll-area)
│   ├── lib/
│   │   ├── api.ts          # Axios REST client instance
│   │   └── socket.ts       # Socket.IO connection manager & reconnect logic
│   ├── store/              # Redux slices for chat state & visitor credentials
│   ├── App.tsx             # Root widget container & launcher button
│   └── main.tsx            # Entry point
├── index.html
├── vite.config.ts
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `widget/` directory:

```env
# Direct API endpoint address for the backend REST service
VITE_API_BASE_URL=http://localhost:8000/api/v1
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
# Running on http://localhost:5173
```

---

## 🛠️ Build & Deployment

- `npm run dev`: Launch Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Build production bundle into `dist/`.
- `npm run preview`: Locally preview the production build.

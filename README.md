# ProjectPulse

> **Production-Quality Real-Time Agency Project Management System**  
> Built with React, Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Socket.io.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.6-2D3748.svg)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## 1. Project Overview

**ProjectPulse** is a production-ready, real-time agency project management dashboard designed for modern digital agencies, consulting firms, and software teams. Unlike simple CRUD applications, ProjectPulse delivers an enterprise-grade multi-tier architecture featuring **backend-enforced Role-Based Access Control (RBAC)**, **resource-level ownership authorization**, **bidirectional real-time WebSocket communication**, **database-backed audit history**, **missed activity recovery**, **background cron jobs**, and a **dual-token JWT authentication system with HttpOnly refresh cookies**.

---

## 2. Key Features

- 🔐 **Dual-Token Authentication (JWT)**: Short-lived access tokens (15m in memory) + cryptographically hashed refresh tokens (7d in secure HttpOnly cookies) with rotation and revocation on logout.
- 🛡️ **Backend-Enforced Authorization**: Strict RBAC and resource-level ownership guards at the controller and service layers. Never relies on UI hiding alone.
- ⚡ **Real-Time WebSocket Architecture**: Role-filtered event streams using Socket.io rooms (`admin-feed`, `pm:{id}`, `dev:{id}`, `project:{id}`).
- 🟢 **Live Team Presence**: Instant online/offline detection with real-time counters and active user rosters powered by WebSockets (zero polling).
- 📜 **Audit Activity Timeline**: Permanent, database-backed immutable history for every task status change and lifecycle event.
- 🔄 **Missed Activity Event Recovery**: Automatically queries the last 20 relevant database events upon user reconnection.
- 🔔 **Real-Time Notification System**: DB-persisted notifications for task assignments and review requests with live badge count updates.
- ⏱️ **Scheduled Overdue Task Detection**: Node-cron background job periodically evaluates task due dates and flags overdue items idempotently.
- 🔍 **Shareable URL Query Filtering**: Search and filter tasks by status, priority, and date range synchronized with URL search params.
- 📊 **Role-Specific Dashboards**:
  - **Admin**: Agency-wide project metrics, status breakdowns, overdue counts, and live presence widgets.
  - **Project Manager**: Project performance metrics, priority breakdowns, and upcoming deadlines this week.
  - **Developer**: Focus queue sorted by priority then due date with one-click status transitions.

---

## 3. Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite 5** (Fast HMR & build)
- **React Router v6** (Nested routes & role guards)
- **TanStack Query v5** (Server state management & caching)
- **Zustand v4** (Client auth & socket presence state)
- **Socket.io Client** (Real-time events)
- **Tailwind CSS v3** (Custom design system)
- **Lucide React** (Icons)
- **date-fns** (Human-readable dates)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** (Relational modeling & transactions)
- **PostgreSQL 15** (Primary relational database)
- **Socket.io** (Authenticated WebSocket server)
- **Zod** (Type-safe input validation)
- **jsonwebtoken** + **bcryptjs** (Auth security)
- **node-cron** (Scheduled background jobs)
- **cookie-parser**, **CORS**, **Helmet** (Security middleware)
- **Winston** (Structured logging)

### DevOps & Development
- **Docker** & **Docker Compose**
- **ESLint** & **Prettier**
- **Jest** & **Supertest** (Automated testing)

---

## 4. Architecture & Clean Layer Separation

ProjectPulse enforces a strict **Controller-Service-Repository** pattern:

```
HTTP Request / WebSocket Event
               │
               ▼
┌──────────────────────────────┐
│     Express Middleware       │  Helmet, CORS, CookieParser, Authenticate (JWT),
│    (Security & Context)      │  Authorize (RBAC), Validate (Zod)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Controllers          │  Thin request/response adapters, status codes,
│    (HTTP Request Parsing)    │  cookie manipulation
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Business Services      │  Ownership validation, business logic,
│     (Core Business Rules)    │  Prisma transactions, Socket.io event emissions
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Repositories         │  Pure data access layer abstracts Prisma queries,
│     (Data Access Layer)      │  includes, selects, and aggregations
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Prisma ORM           │  Type-safe query builder, migration engine
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     PostgreSQL Database      │  Relational storage, foreign keys, indexes
└──────────────────────────────┘
```

---

## 5. Folder Structure

```
velozity-projecthub/
├── .github/
│   └── workflows/ci.yml         # CI/CD pipeline
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── activity/        # Activity feed & timeline
│   │   │   ├── clients/         # Client modal
│   │   │   ├── dashboard/       # Admin, PM, Dev dashboards, Presence widget
│   │   │   ├── layout/          # AppLayout, Sidebar, TopNav
│   │   │   ├── notifications/   # Notification dropdown
│   │   │   ├── projects/        # Project card & modal
│   │   │   ├── tasks/           # Task table, cards, filters, modal
│   │   │   └── ui/              # Badges, buttons, cards, inputs, modals, spinners
│   │   ├── hooks/               # useAuth, useTasks, useProjects, usePresence, etc.
│   │   ├── pages/               # Login, Dashboard, Projects, Tasks, Clients, Users, etc.
│   │   ├── services/            # Axios API services with token refresh interceptors
│   │   ├── socket/              # Socket.io client singleton & event subscribers
│   │   ├── store/               # Zustand stores (authStore, socketStore)
│   │   ├── types/               # Domain interfaces and API types
│   │   ├── App.tsx              # Router & Route guards
│   │   ├── index.css            # Tailwind directives
│   │   └── main.tsx             # Application bootstrap
│   ├── Dockerfile               # Multi-stage production build (Nginx)
│   ├── nginx.conf               # SPA routing & caching rules
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json              # Vercel deployment rewrite rules
│   └── vite.config.ts
├── server/                      # Node.js Express Backend
│   ├── src/
│   │   ├── __tests__/           # Unit and integration test suites
│   │   ├── config/              # Validated env & Prisma singleton
│   │   ├── controllers/         # HTTP controllers
│   │   ├── jobs/                # node-cron background scheduled jobs
│   │   ├── middleware/          # authenticate, authorize, validate, errorHandler
│   │   ├── repositories/        # Prisma data-access abstractions
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Core business logic & transaction handling
│   │   ├── socket/              # WebSocket server, rooms, presence & event handlers
│   │   ├── types/               # Server-specific types
│   │   ├── utils/               # ApiError, JWT, bcrypt, logger, response helpers
│   │   ├── validators/          # Zod schemas
│   │   ├── app.ts               # Express application setup
│   │   └── server.ts            # HTTP & Socket.io server entry point
│   ├── Dockerfile               # Multi-stage production container
│   ├── package.json
│   └── tsconfig.json
├── prisma/
│   ├── schema.prisma            # Relational PostgreSQL schema with indexes
│   └── seed.ts                  # Comprehensive realistic database seed script
├── .env.example                 # Environment variables blueprint
├── .gitignore                   # Comprehensive Node.js / monorepo gitignore
├── docker-compose.yml           # PostgreSQL & pgAdmin services
├── package.json                 # Monorepo workspaces configuration
├── README.md                    # Project documentation
└── render.yaml                  # Render deployment configuration
```

---

## 6. Database Schema & Relationships

The database is built on PostgreSQL with Prisma ORM.

### Entity Relationship Diagram

```
  ┌──────────────┐          1:N           ┌──────────────┐
  │    Client    ├───────────────────────►│   Project    │
  └──────────────┘                        └──────┬───────┘
                                                 │
                                                 │ 1:N
                                                 ▼
  ┌──────────────┐          1:N           ┌──────────────┐
  │     User     ├───────────────────────►│     Task     │
  └───┬───┬───┬──┘ (assignedDeveloperId) └──────┬───────┘
      │   │   │                                  │
      │   │   │ 1:N (createdProjects)            │
      │   │   └─────────────────────────┐        │
      │   │                             ▼        │
      │   │ 1:N                   ┌──────────────┤
      │   └──────────────────────►│ ActivityLog  │◄┘ 1:N (taskId)
      │                           └──────────────┘
      │ 1:N
      ├──────────────────────────►┌──────────────┐
      │                           │ Notification │
      │ 1:N                       └──────────────┘
      └──────────────────────────►┌──────────────┐
                                  │ RefreshToken │
                                  └──────────────┘
```

### Models Summary

| Model | Primary Key | Key Relationships | Key Fields |
|---|---|---|---|
| `User` | `id` (cuid) | Has many Projects, Tasks, ActivityLogs, Notifications, RefreshTokens | `email` (unique), `passwordHash`, `role` (ADMIN, PROJECT_MANAGER, DEVELOPER) |
| `Client` | `id` (cuid) | Has many Projects | `companyName`, `email` (unique), `name`, `phone` |
| `Project` | `id` (cuid) | Belongs to `Client` and `User` (createdBy); Has many `Task` and `ActivityLog` | `name`, `description`, `status` (ACTIVE, ON_HOLD, COMPLETED, CANCELLED) |
| `Task` | `id` (cuid) | Belongs to `Project` and `User` (assignedDeveloper); Has many `ActivityLog` | `title`, `status` (TODO, IN_PROGRESS, IN_REVIEW, DONE), `priority` (LOW, MEDIUM, HIGH, CRITICAL), `dueDate`, `isOverdue` |
| `ActivityLog` | `id` (cuid) | Belongs to `User`, `Project`, optional `Task` | `type`, `oldStatus`, `newStatus`, `description`, `metadata` (JSON), `createdAt` |
| `Notification` | `id` (cuid) | Belongs to `User` | `type`, `title`, `message`, `isRead`, `createdAt`, `readAt` |
| `RefreshToken` | `id` (cuid) | Belongs to `User` | `tokenHash` (SHA-256 unique), `expiresAt`, `revokedAt` |

---

## 7. Indexing Decisions

In accordance with Section 4 requirements, targeted indexes were introduced to optimize read query performance and join latency:

1. **`User.email` & `User.role`**:
   - `email`: Enforces uniqueness and accelerates `findByEmail` lookups during every login attempt.
   - `role`: Supports fast filtering of developers when populating task assignment dropdowns.
2. **`Project.createdById` & `Project.clientId`**:
   - `createdById`: Critical for Project Manager dashboard queries and ownership authorization checks.
   - `clientId`: Speeds up joins when viewing projects by client.
3. **`Task.projectId` & `Task.assignedDeveloperId`**:
   - Foreign key indexes essential for fetching tasks inside a specific project or loading the developer's assigned task queue.
4. **`Task.status`, `Task.priority`, & `Task.dueDate`**:
   - Combined and indexed to support multi-faceted filtering on the `/tasks` list (e.g., `status=IN_PROGRESS&priority=HIGH`) and sorting by priority/due date on the developer dashboard.
5. **`Task.isOverdue`**:
   - Allows the background cron job to query only non-overdue tasks without doing full table scans.
6. **`ActivityLog.projectId`, `ActivityLog.taskId`, & `ActivityLog.createdAt`**:
   - Accelerates nested activity streams (`/projects/:id/activity`) and orders events by timestamp descending.
7. **`Notification.userId` & `Notification.isRead`**:
   - Composite index `[userId, isRead]` optimizes unread counter queries (`countUnread`) that execute on every notification event.
8. **`RefreshToken.tokenHash` & `RefreshToken.userId`**:
   - `tokenHash`: Unique index enables fast lookup when validating and rotating refresh tokens.

---

## 8. Authentication & Security Architecture

ProjectPulse implements a secure **Dual-Token JWT Architecture**:

```
Client                                  Server
  │                                       │
  │── 1. POST /api/auth/login ───────────►│ (Verify bcrypt hash)
  │                                       │ (Generate Access + Refresh tokens)
  │◄── 2. Response: Access Token ─────────│ (Set HttpOnly Cookie: velozity_refresh_token)
  │       (stored in memory / Zustand)    │
  │                                       │
  │── 3. GET /api/tasks ─────────────────►│
  │      Headers: Authorization Bearer    │ (Verify JWT signature & expiry: 15 min)
  │◄── 4. Protected Data ─────────────────│
  │                                       │
  │   [Access Token Expires]              │
  │                                       │
  │── 5. Axios Interceptor catches 401 ───│
  │── 6. POST /api/auth/refresh ─────────►│ (Extract HttpOnly cookie)
  │                                       │ (Verify SHA-256 hash in PostgreSQL)
  │                                       │ (Rotate: revoke old, save new token)
  │◄── 7. New Access Token ───────────────│ (Set new HttpOnly Cookie)
  │── 8. Retry original request ─────────►│
```

### Why Refresh Tokens Use HttpOnly Cookies
Storing refresh tokens in browser `localStorage` or `sessionStorage` exposes them to **Cross-Site Scripting (XSS)** attacks, where any malicious script or compromised third-party library can read and exfiltrate the token. Storing the refresh token inside a **Secure HttpOnly Cookie** guarantees that JavaScript cannot access the token, preventing token theft via XSS.

---

## 9. Authorization Model & Resource Isolation

Authorization is strictly enforced on the server. The application defines three roles:

| Capability | ADMIN | PROJECT_MANAGER | DEVELOPER |
|---|:---:|:---:|:---:|
| Manage Clients (CRUD) | ✅ | ❌ | ❌ |
| Manage Team Users (CRUD) | ✅ | ❌ | ❌ |
| Create Projects | ✅ | ✅ | ❌ |
| View All Projects | ✅ | ❌ (Own only) | ❌ (Assigned only) |
| Edit / Delete Projects | ✅ | ✅ (Own only) | ❌ |
| Create / Delete Tasks | ✅ | ✅ (Own projects) | ❌ |
| View Tasks | ✅ (All) | ✅ (Own projects) | ✅ (Assigned only) |
| Update Task Status | ✅ | ✅ | ✅ (Assigned only) |
| Global Activity Feed | ✅ | ❌ (Own projects) | ❌ (Assigned tasks) |
| Online User Presence Roster | ✅ | ❌ | ❌ |

### Resource-Level Ownership Checks
Even if a user sends a forged request to `/api/projects/:id` or `/api/tasks/:id/status`, the backend executes service-level checks:
- Project Managers attempting to access or modify a project where `createdById !== req.user.userId` receive a **`403 FORBIDDEN`**.
- Developers attempting to view or transition a task where `assignedDeveloperId !== req.user.userId` receive a **`403 FORBIDDEN`**.

---

## 10. Real-Time WebSocket Architecture

ProjectPulse uses **Socket.io** for persistent, bidirectional communication.

### Why Socket.io was Selected
1. **Fallback Capability**: Socket.io starts with HTTP long-polling and automatically upgrades to WebSocket, ensuring connectivity even across restrictive corporate firewalls or proxies.
2. **Built-in Room Multiplexing**: Built-in room abstractions (`join`, `leave`, `to`) make role-filtered event broadcasts clean and maintainable.
3. **Heartbeat & Auto-reconnection**: Built-in ping/pong health checks automatically manage connection lifecycle and trigger reconnection logic.

### WebSocket Rooms
Upon connection, the client authenticates using its JWT access token. The socket joins specific rooms based on its role:
- **`user:{userId}`**: For private push notifications.
- **`admin-feed`**: Admin users receive all system events.
- **`pm:{userId}`**: Project Managers receive activity from projects they created.
- **`dev:{userId}`**: Developers receive updates for tasks assigned to them.
- **`project:{projectId}`**: Project members receive project-specific status changes.

---

## 11. Missed Activity Recovery

When users experience network interruptions or close their browser:
1. When the client reconnects via Socket.io, the server identifies the user's role and ID.
2. The server queries PostgreSQL for the **last 20 activity records** strictly within the user's authorized scope.
3. The server emits an `activity:missed` event with this historical batch.
4. The client updates TanStack Query's cache and prepends any missed events to the feed without duplicates.

The database is always the source of truth—no transient in-memory arrays are used.

---

## 12. WebSocket Presence Implementation

The server maintains a thread-safe `PresenceManager` mapping user IDs to their active socket connections:
- Supports multiple open tabs per user: A user is only marked offline when their **last** active socket disconnects.
- Emits `presence:update` whenever a user's online/offline status transitions.
- The Admin dashboard displays the live count and roster of "Users Online Now" updating automatically in real time without polling.

---

## 13. Atomic Database Transactions

Multi-step operations execute inside **Prisma Transactions (`prisma.$transaction`)** to guarantee consistency:

```typescript
// Changing task status:
await prisma.$transaction(async (tx) => {
  // 1. Update task state
  const updatedTask = await tx.task.update({ ... });

  // 2. Create immutable audit log
  const activity = await tx.activityLog.create({ ... });

  // 3. Create notification for PM if task moved to IN_REVIEW
  if (newStatus === 'IN_REVIEW') {
    await tx.notification.create({ ... });
  }

  return { updatedTask, activity };
});
// 4. Broadcast via WebSockets only after successful commit
```

If any step fails, all operations roll back automatically.

---

## 14. Background Overdue Job

Tasks with `dueDate < NOW` that are not in `DONE` status are marked as overdue.

### Why node-cron was Selected
- **Embedded & Lightweight**: `node-cron` runs within the Node.js process without requiring external infrastructure (like Redis or BullMQ) for single-instance deployments.
- **Predictable Cron Syntax**: Standard 5-field cron syntax (`0 * * * *`) runs every hour at minute zero.
- **Idempotency**: The query targets only `isOverdue: false` tasks, preventing redundant writes:
  ```typescript
  await prisma.task.updateMany({
    where: {
      dueDate: { lt: new Date() },
      status: { notIn: ['DONE'] },
      isOverdue: false, // Idempotent check
    },
    data: { isOverdue: true },
  });
  ```

---

## 15. Environment Variables

Create `.env` in the root directory (based on `.env.example`):

```env
# Node.js
NODE_ENV=development
PORT=5000

# PostgreSQL
DATABASE_URL=postgresql://velozity:velozity_dev_pw@localhost:5432/velozity_projecthub
POSTGRES_USER=velozity
POSTGRES_PASSWORD=velozity_dev_pw
POSTGRES_DB=velozity_projecthub

# JWT Secrets (Use crypto.randomBytes(64).toString('hex'))
JWT_ACCESS_SECRET=super_secret_jwt_access_token_signing_key_32chars_min!
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_signing_key_32chars_min!
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS & Cookies
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Frontend Vite Variables
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 16. Docker Setup

To launch the PostgreSQL container using Docker Compose:

```bash
docker compose up -d db
```

To stop the container:
```bash
docker compose down
```

---

## 17. Local Development Setup

### 1. Prerequisites
- Node.js 18+ and npm
- Docker Desktop running (or local PostgreSQL 15+)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Anubhav-01/inventory-system.git velozity-projecthub
cd velozity-projecthub
npm install
```

### 3. Database Migration & Seed
Start the database container and apply migrations:

```bash
# Start PostgreSQL container
docker compose up -d db

# Apply Prisma migrations
npx prisma migrate dev --name init

# Seed the database
npm run seed
```

### 4. Start the Application
Run both backend and frontend concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 18. Seed Credentials

The seed script creates the following accounts (passwords documented for development/evaluation use only):

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| **ADMIN** | Alex Chen | `admin@velozity.dev` | `Admin123!` | Full system access |
| **PROJECT_MANAGER** | Sarah Mitchell | `pm1@velozity.dev` | `Manager123!` | Owns Projects 1 & 2 |
| **PROJECT_MANAGER** | James Rivera | `pm2@velozity.dev` | `Manager123!` | Owns Projects 3 & 4 |
| **DEVELOPER** | Ravi Patel | `dev1@velozity.dev` | `Dev123!` | Assigned tasks |
| **DEVELOPER** | Emma Watson | `dev2@velozity.dev` | `Dev123!` | Assigned tasks |
| **DEVELOPER** | Carlos Mendez | `dev3@velozity.dev` | `Dev123!` | Assigned tasks |
| **DEVELOPER** | Aisha Johnson | `dev4@velozity.dev` | `Dev123!` | Assigned tasks |

---

## 19. API Overview

All API requests return a standardized envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

Errors return:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this project."
  }
}
```

### Key Endpoints

| Resource | Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | Public | Any | Login and receive access token + HttpOnly cookie |
| | POST | `/api/auth/refresh` | Cookie | Any | Rotate refresh token and get new access token |
| | POST | `/api/auth/logout` | Cookie | Any | Revoke refresh token and clear cookie |
| | GET | `/api/auth/me` | Bearer | Any | Fetch current authenticated user profile |
| **Users** | GET | `/api/users` | Bearer | Admin | List all team members |
| | GET | `/api/users/developers`| Bearer | Admin, PM | List developers for assignment |
| | POST | `/api/users` | Bearer | Admin | Create user |
| **Clients**| GET | `/api/clients` | Bearer | Admin | List clients with project counts |
| | POST | `/api/clients` | Bearer | Admin | Create client |
| **Projects**| GET | `/api/projects` | Bearer | Any | Role-filtered list of projects |
| | POST | `/api/projects` | Bearer | Admin, PM | Create new client project |
| | GET | `/api/projects/:id` | Bearer | Any | Fetch project (verifies ownership) |
| **Tasks** | GET | `/api/tasks` | Bearer | Any | Query tasks (`?status=&priority=&from=&to=`) |
| | POST | `/api/tasks` | Bearer | Admin, PM | Create task in own project |
| | POST | `/api/tasks/:id/status`| Bearer | Any | Update status (creates ActivityLog + Notification) |
| **Activity**| GET | `/api/activity` | Bearer | Any | Role-filtered activity stream |
| **Notifications**| GET | `/api/notifications` | Bearer | Any | Fetch user notifications |
| | GET | `/api/notifications/unread-count` | Bearer | Any | Unread count badge |
| **Dashboard**| GET | `/api/dashboard/admin` | Bearer | Admin | Admin metrics & presence |
| | GET | `/api/dashboard/project-manager`| Bearer| PM, Admin | PM project summaries |
| | GET | `/api/dashboard/developer`| Bearer | Dev, Admin | Developer sorted queue |

---

## 20. Automated Testing

To run the automated test suite:

```bash
npm test
```

The test suites verify:
- JWT token generation, verification, and expiration handling.
- RBAC middleware protection against unauthorized roles.
- Resource-level isolation preventing Project Managers from accessing peer projects.
- Idempotency and correct time evaluation of the background overdue task job.

---

## 21. Production Deployment

### Backend Deployment (Render / Railway)
The backend must run on an environment that supports persistent WebSocket connections (Render web service or container):
1. Create a PostgreSQL database on Render.
2. Deploy the `server/` service using `render.yaml` or Docker container.
3. Configure environment variables: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`.

### Frontend Deployment (Vercel)
1. Link your repository to Vercel and set the Root Directory to `client`.
2. Set Build Command to `npm run build` and Output Directory to `dist`.
3. Set environment variables:
   - `VITE_API_URL`: Your hosted backend URL (e.g. `https://api.velozity.dev`)
   - `VITE_SOCKET_URL`: Your hosted backend URL (e.g. `https://api.velozity.dev`)
4. The included `client/vercel.json` ensures client-side routes fallback to `index.html`.

---

## 22. Known Limitations & Future Improvements

- **Current Limitations**:
  - In-memory presence is bound to a single server instance.
  - node-cron runs on the application process rather than a dedicated worker queue.
- **Planned Improvements**:
  - Redis Adapter for Socket.io to allow multi-instance horizontal scaling.
  - BullMQ with Redis for distributed background job queuing and retries.
  - Multi-factor authentication (TOTP) and SAML/SSO enterprise integration.
  - File attachments for tasks via AWS S3 / Cloudflare R2 presigned URLs.

---

## 23. License

MIT &copy; 2026 ProjectPulse. All rights reserved.


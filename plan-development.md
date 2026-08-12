# Development Plan: Minimalistic Kanban Task Manager

This document is a comprehensive, step-by-step execution plan designed to be followed linearly. Do not skip steps. Do not add unrequested features. Follow the exact instructions and code architectures defined below.

## Tech Stack Definition

- **Framework:** Next.js (App Router, React Server Components, Server Actions)
- **Language:** TypeScript
- **Package Manager:** `bun`
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Lucide React (icons)
- **Database ORM:** Prisma (Already setup: SQLite for dev, PostgreSQL for prod)
- **Authentication:** `better-auth` (Already setup with Admin plugin for RBAC)
- **Forms & Validation:** `react-hook-form`, Zod
- **Animations:** `motion` (motion.dev)
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Image Processing:** `use-file-picker` (client), `sharp` (server)
- **State Management:** React `useState` (use Jotai only if global state is strictly required)
- **Route Architecture:** `src/app/(public)/..` and `src/app/(private)/..`

---

## Phase 1: Project Initialization & Dependencies

### 1.1 Scaffold Next.js App (If not already done)

- [ ] Run scaffold command: `bun create next-app kanban-app`
- [ ] Select: TypeScript: Yes, ESLint: Yes, Tailwind CSS: Yes, `src/` directory: Yes, App Router: Yes, Import alias: Yes (`@/*`).

### 1.2 Install Core Dependencies

- [ ] Run: `bun add zod react-hook-form @hookform/resolvers motion sharp jotai lucide-react`
- [ ] Run DnD dependencies: `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

### 1.3 Initialize shadcn/ui (If not already done)

- [ ] Run: `bunx shadcn-ui@latest init`
- [ ] Choose: Default style, Slate base color, CSS variables: Yes.
- [ ] Add required components: `bunx shadcn-ui@latest add button card dialog form input select textarea dropdown-menu avatar table badge`

---

## Phase 2: Prisma Schema Definition

_(Assuming Prisma is already initialized with SQLite)_

### 2.1 Define Prisma Schema

- [ ] Update `prisma/schema.prisma` with the following models. Ensure they integrate with your existing `better-auth` User model (add the missing fields/relations).

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Switch to "postgresql" for production
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  image         String?
  role          String         @default("user") // "user" | "admin" (managed by better-auth admin plugin)
  banned        Boolean        @default(false)  // (managed by better-auth admin plugin)
  tasks         Task[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Task {
  id          String   @id @default(cuid())
  title       String
  status      String   @default("TODO") // "TODO", "IN_PROGRESS", "DONE"
  priority    String   @default("MEDIUM") // "LOW", "MEDIUM", "HIGH"
  dueDate     DateTime?
  order       Int      @default(0)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2.2 Push Database

- [ ] Run: `bunx prisma db push`
- [ ] Run: `bunx prisma generate`

---

## Phase 3: Route Architecture & Middleware Protection

### 3.1 Establish Route Groups

- [ ] Create directory `src/app/(public)`. This will hold routes accessible without authentication.
- [ ] Create directory `src/app/(private)`. This will hold routes requiring authentication.

### 3.2 Middleware Protection

- [ ] Create or update `middleware.ts` in the root directory (or `src/`).
- [ ] Implement logic to check the `better-auth` session.
- [ ] If the user is unauthenticated and tries to access any route inside `(private)`, redirect to `src/app/(public)/login`.
- [ ] If the user is authenticated and tries to access `(public)/login` or `(public)/register`, redirect to `src/app/(private)/` (the dashboard).
- [ ] If the user is accessing `src/app/(private)/admin`, verify `session.user.role === "admin"`. If not, redirect to `src/app/(private)/`.

### 3.3 Auth UI (Public Routes)

- [ ] Create `src/app/(public)/login/page.tsx` and `src/app/(public)/register/page.tsx`.
- [ ] Use `react-hook-form` + `zod` for validation.
- [ ] Use the `better-auth` client hooks for submission. On success, use `router.push("/")` to enter the private area.

---

## Phase 4: Core Layout & Avatar Upload

### 4.1 Private Dashboard Layout

- [ ] Create `src/app/(private)/layout.tsx`.
- [ ] This layout wraps all authenticated pages. Fetch the current user session.
- [ ] Include a minimalistic Navbar with the app title, user avatar dropdown (containing Logout), and a link to Admin Dashboard if `session.user.role === "admin"`.
- [ ] Create the main dashboard page at `src/app/(private)/page.tsx` (this will host the Kanban board).

### 4.2 Avatar Upload Implementation

- [ ] In the Navbar dropdown, add a "Change Avatar" button triggering `use-file-picker`.
- [ ] Use `use-file-picker` to accept an image file from the UI.
- [ ] Create a Server Action `src/actions/user.ts` called `uploadAvatar(file: File)`.
- [ ] In the Server Action:
  1. Convert `File` to `ArrayBuffer` using `await file.arrayBuffer()`.
  2. Convert `ArrayBuffer` to `Buffer` for `sharp`.
  3. Use `sharp(buffer).resize(200, 200).webp({ quality: 80 }).toFile('public/uploads/...')`.
  4. Update the `User` model in Prisma with the new image path.
  5. Call `revalidatePath("/")` to update the UI with the new avatar.

---

## Phase 5: Task CRUD Operations & Forms

### 5.1 Zod Schemas

- [ ] Create `src/lib/schemas/task.ts`. Define a `TaskSchema` for `title` (string, min 1 char), `priority` (enum: LOW, MEDIUM, HIGH), `dueDate` (date optional).

### 5.2 Server Actions (`src/actions/task.ts`)

- [ ] **`createTask(data)`**: Validate with Zod. Calculate `order` (get max order for user + 1). Save to DB. `revalidatePath("/")`.
- [ ] **`updateTask(id, data)`**: Validate. Update DB. `revalidatePath("/")`.
- [ ] **`deleteTask(id)`**: Delete from DB. `revalidatePath("/")`.

### 5.3 Task Dialog UI

- [ ] Create `src/components/TaskDialog.tsx` (Client Component).
- [ ] Use shadcn `Dialog`, `Form`, `Input`, `Select`.
- [ ] Use `react-hook-form` with the Zod schema.
- [ ] On submit, call `createTask` or `updateTask` Server Action.
- [ ] Wrap the Dialog component in `motion` for a smooth open/close transition.

---

## Phase 6: Kanban Board UI & Drag-and-Drop

### 6.1 Board Container

- [ ] Create `src/components/KanbanBoard.tsx` (Server Component).
- [ ] Fetch all tasks for the current user ordered by `order`.
- [ ] Group tasks into three arrays based on `status`: `TODO`, `IN_PROGRESS`, `DONE`.
- [ ] Render a client wrapper component for DnD context.

### 6.2 Column Component

- [ ] Create `src/components/KanbanColumn.tsx` (Client Component).
- [ ] Render a fixed title ("To Do", "In Progress", "Done") and map over tasks to render `TaskCard`.

### 6.3 Task Card Component

- [ ] Create `src/components/TaskCard.tsx` (Client Component).
- [ ] Make it sortable using `@dnd-kit/sortable` (`useSortable`).
- [ ] Display Title, Due Date (with Lucide calendar icon), and Priority (with colored Lucide arrow icons: Red Up, Blue Equals, Grey Down).

### 6.4 DnD Logic & Server Sync

- [ ] In a client wrapper (e.g., `src/components/DndWrapper.tsx`), set up `<DndContext>` and `<SortableContext>`.
- [ ] Implement `onDragEnd` handler:
  1. Determine if the task moved to a new column or just reordered within the same column.
  2. Update local state optimistically (using `useState`) so the UI feels instant.
  3. Create a Server Action `updateTaskOrder(taskId, newStatus, newOrder)`.
  4. Pass the new status and index to the Server Action.
  5. The Server Action updates the `status` and `order` of the dragged task, and batch-updates the `order` of all other tasks in the affected columns to maintain a strict `0, 1, 2...` sequence.
  6. Call `revalidatePath("/")`.

---

## Phase 7: Admin Dashboard

### 7.1 Admin Layout & Route

- [ ] Create `src/app/(private)/admin/page.tsx`.
- [ ] This is protected by middleware, but also verify `session.user.role === "admin"` inside the Server Component before querying data.

### 7.2 User Management Table

- [ ] Fetch all users from Prisma.
- [ ] Render a shadcn `Table`.
- [ ] Columns: Avatar, Name, Email, Role, Status (Banned/Active), Actions.
- [ ] Actions Dropdown (Lucide menu icon): "Make Admin" / "Make User", "Ban User" / "Unban User".

### 7.3 Admin Server Actions (`src/actions/admin.ts`)

- [ ] **`toggleUserRole(userId)`**: Swap role between "user" and "admin" (using better-auth admin plugin capabilities if available, else direct Prisma update).
- [ ] **`toggleBanStatus(userId)`**: Swap `banned` boolean (using better-auth admin plugin capabilities).
- [ ] Both actions must verify the calling user is an admin before proceeding. `revalidatePath("/admin")` after execution.

---

## Phase 8: Final Polish & Production Prep

### 8 Empty States & Loading

- [ ] Add a minimalistic empty state component for the Kanban board (e.g., "No tasks yet. Create one!").
- [ ] Use standard Tailwind skeleton loaders for initial data fetching if needed.

---

**End of Plan. Begin Execution.**

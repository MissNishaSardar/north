# Codebase Review: north

**Date**: 2026-07-22
**Scope**: ~5,125 lines across 62 source files in `src/`
**Stack**: Next.js 16.2 + React 19.2, Prisma 7 + SQLite (LibSQL), Better Auth, Base UI / shadcn, Tailwind v4, react-hook-form + Zod

---

## Overview

A task management application with Kanban board, user profile management, and authentication flows. Built on the App Router with server components for pages and client components for interactive elements.

---

## Dead / Orphaned Code

Remove these files — they serve no purpose:

| File                                     | Lines | Problem                                                                                                                                  |
| ---------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/auth-actions.ts`             | 127   | 8 server actions (`signUpAction`, `signInAction`, etc.) — zero imports from any component; all auth goes through `authClient.*` directly |
| `src/components/Buttons/ToastButton.tsx` | 16    | Demo component, no callers anywhere                                                                                                      |

---

## Bugs

| Location                                       | Lines | Bug                                                                                                                                                    |
| ---------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/server/updateAvatar.ts:55`                | 71    | **Old avatar never deleted.** Filename is always `<userId>.webp`, so `oldPath !== filepath` is always false — the condition can never match            |
| `src/lib/zodSchema.ts` (`updateProfileSchema`) | 62    | **Phone overflow risk.** `phone` is validated as 10 digits but stored as Prisma `Int`. Phone numbers > 2,147,483,647 will overflow. Should be `String` |
| `prisma/schema.prisma`                         | 101   | **`phone` field is `Int`** — cannot store leading zeros, limited range. Schema type mismatch with the form validation                                  |

---

## Redundancy & Duplication

| What                                  | Details                                                                                                                                | Fix                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Relative time formatting**          | `Intl.RelativeTimeFormat` logic duplicated in `src/app/(private)/tasks/[id]/page.tsx` and `src/components/Profile/ViewProfile.tsx`     | Extract to `src/lib/formatRelativeTime.ts`                                                     |
| **Task types diverged**               | `KanbanBoard/types.ts` has `KanbanTask` (6 fields); `ExpiredTaskCard` and `TaskRow` define their own local types with different fields | One shared `Task` type imported everywhere                                                     |
| **Auth guard layered**                | Private layout checks session → every server action rechecks session → unused `requireAuthAction` also exists                          | Pick one enforcement layer                                                                     |
| **Calendar pickers nearly identical** | `DateOfBirthPicker.tsx` (79 lines) and `DueDatePicker.tsx` (74 lines) are the same popover calendar with different constraints         | Could share a single `DatePicker` component, or replace both with native `<input type="date">` |

---

## Over-Engineering

### Biggest Wins

| File                                           | Lines | Replace With          | Savings    |
| ---------------------------------------------- | ----- | --------------------- | ---------- |
| `src/components/Tasks/TimePicker.tsx`          | 174   | `<input type="time">` | ~170 lines |
| `src/components/Profile/DateOfBirthPicker.tsx` | 79    | `<input type="date">` | ~75 lines  |
| `src/components/Tasks/DueDatePicker.tsx`       | 74    | `<input type="date">` | ~70 lines  |

Native HTML date/time inputs have >99% browser support, are more accessible, and zero maintenance.

### Questionable Complexity

| File                                       | Lines | Concern                                                                                                                                        |
| ------------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Tasks/ExpiredTaskCard.tsx` | 273   | 6 action handlers + expansion state for overdue task management. Does each overdue task need its own inline date picker and 5 action buttons?  |
| `src/components/KanbanBoard/` (3 files)    | 318   | `@dnd-kit/core` dependency (~12KB) for a 3-column board. A click-to-change-status pattern (already used in `TaskRow`) would be simpler for MVP |
| `src/components/Profile/countries.ts`      | 32    | 19 countries hardcoded with flag emoji. If dial codes are the goal, derive from `Intl` APIs or use a maintained library                        |
| `src/components/Profile/ProfileForm.tsx`   | 326   | 9 form fields is large but justified — profile forms are inherently field-heavy. However, the phone + country-code split adds complexity       |

### Ponytail Score

If all over-engineering items were addressed: **~700 lines removed** (~14% of the codebase).

---

## Architecture Observations

### What Works Well

- **Consistent form pattern**: Every form uses the same `react-hook-form` + `Controller` + Zod resolver pattern. Easy to maintain.
- **Strong typing end-to-end**: Zod schemas infer types used across server actions, forms, and components.
- **Ownership checks**: Every task mutation verifies `userId` match — no data leaks between users.
- **SSR hydration safety**: `KanbanBoard` uses `useSyncExternalStore` to avoid rendering drag-and-drop on the server.
- **Error handling**: All server actions return `{ error, ...result }` consistently.

### What Needs Attention

| Category                                   | Detail                                                                                                                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No tests**                               | Zero test files. Only verification is `bun lint` + `bun run build`. No test framework in `package.json`.                                                                                        |
| **No migrations**                          | Schema exists but `prisma/migrations/` is absent. Schema changes require `bun migrate` to create them.                                                                                          |
| **`clientEnv.ts` is a stub**               | Empty shell with only commented-out examples. No client-side env vars validated.                                                                                                                |
| **Monolithic server actions**              | `task-actions.ts` (343 lines) holds 12 functions. Could split by concern (CRUD, status, queries).                                                                                               |
| **`@ts-expect-error` on typedRoutes**      | `BreadcrumbNav.tsx` suppresses the error for dynamic route strings — fragile.                                                                                                                   |
| **`proxy.ts` auth is session-cookie only** | `src/proxy.ts` only guards `/dashboard`. Other private routes are guarded by the private layout instead. Proxy could be the single auth gate. (Next.js 16 convention: replaces `middleware.ts`) |

---

## Prisma Schema Review

`prisma/schema.prisma` — 5 models, 101 lines

| Issue                                     | Location   | Suggestion                                                                            |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `phone` is `Int`                          | User model | Change to `String` — phone numbers need leading zeros and can exceed int range        |
| `@@unique([email])`                       | User model | Use `@unique` directly on the `email` field instead of a compound unique constraint   |
| No `status` index                         | Task model | `status` is filtered in KanbanBoard queries — add `@@index([status])`                 |
| `dismissedAt` without `dismissed` boolean | Task model | A boolean `dismissed` field is clearer than checking `dismissedAt != null` in queries |

---

## Files by Size (largest)

| File                                       | Lines | Notes                                                                |
| ------------------------------------------ | ----- | -------------------------------------------------------------------- |
| `src/components/shadcnui/sidebar.tsx`      | 726   | Full sidebar library (context, CVA, persistence, keyboard shortcuts) |
| `src/server/task-actions.ts`               | 343   | 12 server actions, monolith                                          |
| `src/components/Profile/ProfileForm.tsx`   | 326   | 9 fields, 2-column layout                                            |
| `src/components/Tasks/ExpiredTaskCard.tsx` | 273   | 6 actions, expansion state                                           |
| `src/components/Tasks/TaskForm.tsx`        | 246   | Dual create/edit, date+time combination                              |
| `src/components/shadcnui/calendar.tsx`     | 221   | DayPicker customization                                              |
| `src/components/shadcnui/select.tsx`       | 204   | Full select primitive                                                |
| `src/components/shadcnui/alert-dialog.tsx` | 187   | Alert dialog with sub-components                                     |
| `src/components/Tasks/TimePicker.tsx`      | 174   | Custom 12-hour time selector                                         |

---

## Summary

### Top 5 Quick Wins

1. **Delete 2 dead files** (`auth-actions.ts`, `ToastButton.tsx`) — saves ~140 lines
2. **Replace TimePicker with `<input type="time">`** — saves ~170 lines, more accessible
3. **Replace DateOfBirthPicker + DueDatePicker with `<input type="date">`** — saves ~150 lines
4. **Fix avatar deletion bug** (one line: `oldPath !== filepath` logic is always false)
5. **Extract shared `formatRelativeTime` utility** — deduplicates ~40 lines

### Biggest Risk

**No tests.** The entire app relies on TypeScript compilation and ESLint for verification. Every server action, every form submission, every auth flow is untested.

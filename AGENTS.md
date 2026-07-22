<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:form-patterns -->

# Form Patterns

Schemas in `src/lib/zodSchema.ts` — export both schema and `type X = z.infer<typeof xSchema>`.

Components use `"use client"`, `react-hook-form` + `@hookform/resolvers/zod`, and shadcn primitives:

```typescript
const { handleSubmit, control, formState: { isSubmitting } } = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... },
  mode: "all",
});
```

Each field goes through `Controller`:

```typescript
<Controller
  name="fieldName"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="..." />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

Submit: `<form onSubmit={handleSubmit(handler)} noValidate>`. Button disabled while submitting with icon toggle.

See existing examples under `src/components/Auth/`.

### Edit forms with redirect + `isDirty`

Edit forms (e.g. `ProfileForm`) that live on a separate edit page should redirect back to the view page after saving:

```typescript
import { useRouter } from "next/navigation";

const { push } = useRouter();

const onSubmit = async (data) => {
  const { error } = await updateAction(data);
  if (error) {
    toast.error(error);
  } else {
    toast.success("Updated!");
    push("/view-page"); // redirect back to view page
  }
};
```

Submit button uses `isDirty` to stay disabled when no changes were made:

```typescript
<Button type="submit" disabled={isSubmitting || !isDirty || !isValid}>
```

`defaultValues` are pre-filled from the fetched data so `isDirty` correctly tracks user modifications.

### TypeScript gotcha — `""` literal type in component props

Do **not** use `""` (empty-string literal type) in component prop types or object type aliases for data coming from the database:

```typescript
// WRONG — breaks when Prisma returns actual strings like "John"
type Props = { user: { name: "" } };

// RIGHT — use standard string types
type Props = { user: { name: string } };
```

The `""` literal type only accepts the empty string, but Prisma always returns `string` for text fields. Use `string` / `string | null` in prop types. The `?? ""` fallback pattern in `defaultValues` is fine for form initialization.

<!-- END:form-patterns -->

## Agent behavior

- **Ask questions.** When ambiguous or before destructive actions, use the `question` tool. Prefer one short batched question.
- **Remember new learning.** Add non-obvious gotchas back to this file; delete stale entries.
- **Use available skills and MCPs.** Before writing code, load relevant skills (`shadcn`, `prisma-*`, `next-*`, `better-auth-*`, `zod`). Use the `shadcn` and `better-auth` MCPs for component or auth setup instead of guessing.

## Stack at a glance

- Next.js 16.2 + React 19.2 (App Router, Turbopack default, React Compiler on, `typedRoutes` on)
- Prisma 7 with `@prisma/adapter-libsql` (SQLite, file-backed)
- Tailwind CSS v4 (CSS-only config in `globals.css`; no `tailwind.config.ts`)
- shadcn/ui with the `base-luma` style preset; primitives from `@base-ui/react` (not Radix)
- `next-themes` (default `dark`, `enableSystem={false}`), `react-toastify`, `lucide-react`
- `@t3-oss/env-nextjs` + Zod for env validation
- `@dnd-kit/core` for Kanban board drag-and-drop
- No test framework — `bun lint` + `bun run build` are the only verification

## Verification

- **Primary check**: `bun lint` — runs `eslint` with `eslint-config-next` core-web-vitals + typescript.
- **Secondary / type gate**: `bun run build`. There is no separate `typecheck` script; TypeScript errors surface only during the build.
- **Full prod check**: `bun prod` — `prisma generate && eslint && next build && next start`. Use before schema or env changes.

## Proxy (replaces middleware.ts)

- Next.js 16 renamed `middleware.ts` to `proxy.ts`. The file is `src/proxy.ts`.
- Exports a named `proxy` function and a `config` object with `matcher`.
- Currently guards `/dashboard` by checking `better-auth.session_token` cookie.
- Only one proxy file per project; split logic into imported modules if needed.
- Do not create a `middleware.ts` — it is deprecated.

## Prisma (Prisma 7, custom output)

- Generator: `provider = "prisma-client"`, `output = "../generated/prisma"`. This is the Prisma 7 generator, **not** `prisma-client-js`.
- Import the client as `import { PrismaClient } from "@generated/prisma/client"`. There is no `@prisma/client` import surface in this repo.
- `prisma/schema.prisma` has **no** `datasource.url` line. The URL comes from `prisma.config.ts` via `env("DATABASE_URL")` (loaded with `dotenv/config`). Do not add it back inline.
- `src/lib/database/dbClient.ts` is a `globalThis` singleton (HMR-safe) wired to `PrismaLibSql`. Do not instantiate `PrismaClient` elsewhere; import from this file.
- `serverEnv.DATABASE_URL` is Zod-validated to start with `file:./` (`src/lib/env/serverEnv.ts`). A non-`file:./` URL throws at boot.
- No migrations exist yet — `bun migrate` (`prisma migrate dev && prisma generate`) creates `prisma/migrations/`. Schema edits go through that command, not `prisma db push`.
- `bun studio` runs headless (`--browser none`); open the printed URL in a browser manually.
- `generated/**` is gitignored and excluded from ESLint. Do not hand-edit generated files.
- `build` and `prod` scripts prepend `prisma generate` — running raw `next build` will fail with missing types if the client is stale.
- **Phone gotcha**: `User.phone` is Prisma `Int`, not `String`. Cannot store leading zeros or numbers > 2.1B. Forms validate 10 digits and store separately from `countryCode`.

## Env validation (T3 env)

- `src/lib/env/clientEnv.ts` and `src/lib/env/serverEnv.ts` define Zod schemas via `@t3-oss/env-nextjs`.
- `serverEnv.ts` uses `experimental__runtimeEnv: process.env`. The `experimental__` prefix is required for non-Next-runtime access — keep it verbatim.
- `next.config.ts` imports both env files **as side effects** at the top of the module to trigger validation at load time. Do not remove those imports; the rest of the app reads `serverEnv` / `clientEnv` from those modules.
- New vars: add to `serverEnv.ts` (server) or `clientEnv.ts` (must be `NEXT_PUBLIC_*`) and mirror in `.env.example`.
- `clientEnv.ts` is currently a stub (empty) — no client env vars are validated yet.

## Better Auth

- Server auth instance: `src/lib/auth.ts` — creates `betterAuth` with Prisma adapter + email/password.
- Client auth instance: `src/lib/auth-client.ts` — `createAuthClient()` from `better-auth/react`.
- API catch-all: `src/app/api/auth/[...all]/route.ts` re-exports `GET`/`POST` from `better-auth/next-js`.
- Client components call `authClient.signIn.email()`, `authClient.signUp.email()`, etc. directly.
- Server components/layouts call `auth.api.getSession()` from `src/lib/auth.ts` using `headers()`.
- Private layout (`src/app/(private)/layout.tsx`) checks session server-side and redirects to `/login`.
- Each server action in `src/server/` re-checks the session independently (belt-and-suspenders).
- **Do not import from `src/server/auth-actions.ts`** — all 8 functions are unused; components use `authClient` directly.

## Server actions

- All in `src/server/` with `"use server"` directive.
- Consistent return shape: `{ ..., error: null }` on success, `{ error: "message" }` on failure.
- Client components destructure `const { error } = await action(data)` and show toast on error.
- Task actions verify ownership (`findFirst({ where: { id, userId } })`) before any mutation.

## Styling

- Tailwind v4: all config lives in `src/app/globals.css` via `@theme` and `@custom-variant`. PostCSS plugin is `@tailwindcss/postcss`. There is no `tailwind.config.ts` — do not create one.
- `globals.css` imports `shadcn/tailwind.css`; removing it breaks the Base Luma design tokens.
- Prettier: `singleAttributePerLine: true`, `bracketSameLine: true`, `experimentalTernaries: true`, and `prettier-plugin-tailwindcss` is enabled. New code matches (one prop per line; JSX closing bracket on the same line as the tag).

## shadcn / Base UI

- `components.json` sets `ui` → `@/components/shadcnui` (not the default `@/components/ui`). Add components with `bunx shadcn add ...`; they land in `src/components/shadcnui/`.
- The shipped `Button` wraps `Button as ButtonPrimitive` from `@base-ui/react/button`. Do not introduce Radix or `react-aria` primitives — they don't share the Base Luma styling.
- **Base UI `render` prop**: When composing shadcn components that wrap Base UI primitives (e.g. `PopoverTrigger` + `Button`), use the `render` prop instead of nesting:
  ```tsx
  // WRONG — creates nested <button> elements
  <PopoverTrigger><Button>...</Button></PopoverTrigger>

  // RIGHT — Base UI clones Button and merges handlers
  <PopoverTrigger render={<Button>...</Button>} />
  ```
- **Date picker**: Uses `Popover` + `Calendar` (built on `react-day-picker` v10 + `date-fns`). Add via `bunx shadcn add popover calendar`. Calendar uses `startMonth`/`endMonth` (Date objects) for year range, not `fromYear`/`toYear`.

## Path aliases (`tsconfig.json`)

- `@/*` → `./src/*`
- `@generated/*` → `./generated/*` (Prisma client only)

## Reserved directories

- `src/server/` — server-only modules (server actions, `"use server"` files). Currently holds `task-actions.ts`, `profile-actions.ts`, `auth-actions.ts` (unused), `updateAvatar.ts`.
- `src/hooks/` — custom React hooks. Currently holds `use-mobile.ts`.

## Package manager

- `bun.lock` is committed; Bun is the primary workflow (`bun install`, `bun <script>`). npm works (engines pin `node >=24`, `npm >=11`) but the scripts and README are written around `bun`.

## Header back navigation

Place page-specific back links in the app header via `BreadcrumbNav` (`src/components/BreadcrumbNav.tsx`). It reads `usePathname()` and maps routes to back-link configs (exact match or regex pattern). Added after `SidebarTrigger` in `src/app/(private)/layout.tsx`.

## Relative timestamps

Use `Intl.RelativeTimeFormat` (no dependency) for timestamps < 24h, fall back to `Intl.DateTimeFormat`. The logic is currently duplicated in `tasks/[id]/page.tsx` and `ViewProfile.tsx` — extract to `src/lib/` if adding a third use.

## Known dead / unused code

- `src/server/auth-actions.ts` — all 8 functions, zero callers
- `src/components/Buttons/ToastButton.tsx` — demo button, no callers

## Misc

- ESLint ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `generated/**`.
- `.env` is gitignored; `.env.example` is the committed template. Do not commit secrets.
- `CHECKPOINT_DISABLE=1` is set to silence Prisma telemetry.
- No CI workflows or pre-commit hooks exist. Pre-PR verification is `bun lint` then `bun run build` (see Verification above).

## Git commits

Use PowerShell here-strings:

```powershell
git commit -m @"
commit message here
"@
```

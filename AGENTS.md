<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Stack

| Pkg           | Ver                | Note                                                                                                                                                                 |
| ------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js       | ^16.2              | `reactCompiler: true`, `typedRoutes: true`                                                                                                                           |
| React         | ^19.2              |                                                                                                                                                                      |
| TypeScript    | ^5.9               | strict, ESNext module, bundler resolution                                                                                                                            |
| Prisma        | ^7.9               | Uses `prisma-client` generator (not `prisma-client-js`). Output: `generated/prisma`. Driver adapter: `@prisma/adapter-libsql` for SQLite. Config: `prisma.config.ts` |
| shadcn/ui     | base-vega style    | Components in `src/components/shadcnui/`. Aliased as `@/components/shadcnui`                                                                                         |
| Base UI React | ^1.6               | Primitive provider for shadcn components (e.g., `@base-ui/react/button`)                                                                                             |
| Tailwind CSS  | ^4.3               | `@tailwindcss/postcss` plugin, `tw-animate-css`, `shadcn/tailwind.css`                                                                                               |
| Zod           | ^4.4               | Schema validation                                                                                                                                                    |
| env           | @t3-oss/env-nextjs | Split: `src/lib/env/serverEnv.ts` + `clientEnv.ts`                                                                                                                   |

Path aliases: `@/*` → `./src/*`, `@generated/*` → `./generated/*`.

## Agent behavior

- **Ask questions** when ambiguous or before destructive actions. Prefer one batched question.
- **Update this file** when you discover non-obvious gotchas, fixes, or conventions.
- **Use skills + MCPs** before writing code matching `prisma-*`, `next-*`, `better-auth-*`, `zod`, etc. Use `shadcn` MCP for component add/search/audit. Use `better-auth` MCP for auth docs.

## Verification

- **Primary**: `bun lint` — runs `next typegen && tsc --noEmit && eslint`
- **Build gate**: `bun run build` — `prisma generate && next build`
- **Full prod**: `bun prod` — `prisma generate && next build && next start` (before schema/env changes)

## Project structure

```
src/
  app/              # App Router (layout.tsx, globals.css)
    (public)/       # Route group: routes accessible without auth (homepage, sign-in)
    (private)/      # Route group: gated by (private)/layout.tsx session check
    api/            # API routes — keep at root, NOT inside route groups
  components/
    Layout/         # Header, ThemeToggleButton
    Providers/      # ThemeProvider (next-themes)
    shadcnui/       # shadcn primitives (button.tsx, toast.tsx)
  hooks/            # Custom hooks (currently empty)
  lib/
    dbClient/       # Prisma singleton with libSQL adapter
    env/            # serverEnv.ts, clientEnv.ts (t3-env)
    fonts.ts        # next/font (Geist, Inter)
    types.ts        # LayoutProps
    utils.ts        # cn() helper (clsx + tailwind-merge)
  server/           # API routes placeholder (empty)
generated/prisma/   # Prisma client output (gitignored)
public/uploads/     # User uploads (all files ignored except .gitkeep)
```

## Gitignore pattern: uploads

`public/uploads/*` + `!public/uploads/.gitkeep` — ignores all uploaded files but keeps empty dir tracked via `.gitkeep`. Do not add `public/uploads/` itself to gitignore.

## Better Auth

- `src/lib/auth.ts` uses `prismaAdapter` from `better-auth/adapters/prisma` with the existing `dbClient` singleton (libSQL driver adapter). Do NOT use raw `bun:sqlite`/`new Database()` — creates a separate DB and breaks the Prisma singleton.
- Env via `serverEnv`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (normalized without trailing slash). Never hardcode `baseURL` in auth.ts.
- After adding/changing plugins, re-run: `bunx @better-auth/cli generate --config src/lib/auth.ts --output prisma/schema.prisma --yes` then `bunx prisma migrate dev --name <name>` + `bunx prisma generate` (the `prisma-client` generator is NOT run by `migrate dev` alone).
- Verify: `GET /api/auth/ok` → `{"ok":true}`.
- `bun run migrate` runs `prisma migrate dev` which PROMPTS for a migration name when schema changed — hang in non-interactive shells. Use `bunx prisma migrate dev --name <name>` instead.
- Admin plugin is enabled (`plugins: [admin(), nextCookies()]`). Schema adds `role`/`banned`/`banReason`/`banExpires` on User. If re-running the CLI generate reverts `role` to nullable/`banned` optional, re-apply the non-null defaults by hand (managed fields).
- Better Auth config uses model names (`@@map`), not table names. Rate limiting is enabled with `storage: "database"` (adds the `RateLimit` model).
- Route gating: `(private)/layout.tsx` checks `auth.api.getSession({ headers: await headers() })` and `redirect("/sign-in")`, and `src/proxy.ts` (Next 16 proxy) does the optimistic gate: no session cookie on `/dashboard`|`/admin` → `/sign-in`; valid session on `/sign-in`|`/sign-up` → `/dashboard`; `/admin` without `role === "admin"` → `/dashboard`. Add future private pages to `PRIVATE_PATHS` in `proxy.ts`. Layout checks don't re-run on client navigation, so the proxy carries the redirect.
- Emails: `sendResetPassword` currently logs the reset URL via `console.log` (mock). Swap for a real provider when one is added.

## Key restrictions

- **ESLint**: Locked at eslint@9.x until `eslint-plugin-react` ships v10 support. Do NOT bump.
- **TypeScript**: Currently ^5.9. TS 7.0 (Go-native compiler) blocked until typescript-eslint API stabilizes (~Oct 2026). Do not migrate.
- **shadcn `use-mobile` hook**: The shipped version calls `setState` synchronously in `useEffect` and fails the `react-hooks/set-state-in-effect` rule (reactCompiler project). Keep the local fix in `src/hooks/use-mobile.ts` (lazy `useState` initializer + `mql.matches` in the change listener). A `shadcn add sidebar` update will overwrite it — re-apply the fix.
- **Sidebar nav items**: With `typedRoutes`, array literals (incl. conditional spreads) widen `url` to `string` and fail `tsc`. Annotate items with an explicit type (`url: Route`, `icon: LucideIcon`) and build the array with conditional `push`.

## Form patterns

Schemas in `src/lib/zodSchema.ts` — export schema and type as `nameSchema`/`nameType` pairs (e.g. `signinSchema`/`signinType`). Auth forms live in `src/components/Auth/` (client components); the shadcn `Card` wrapper + `Metadata` export live on the server page.

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

## Git commits

Use PowerShell here-strings:

```powershell
git commit -m @"
<commit message here>
"@
```

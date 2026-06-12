# Login/Register Zod Schema Plan

Implement separate Zod schemas in `src/lib/zodSchema.ts` for login and register forms, matching the repo's form convention of exporting both the schema and a `z.infer` type.

## Scope

- `loginSchema`
  - `email`: required string, trimmed, valid email format.
  - `password`: required string, minimum 8 characters.
  - `rememberMe`: optional boolean, defaulting to `false`.

- `registerSchema`
  - `name`: required string, trimmed, minimum 2 characters and maximum 80 characters.
  - `email`: required string, trimmed, valid email format.
  - `password`: required string, minimum 8 characters.
  - `passwordConfirmation`: required string, minimum 8 characters, must equal `password`.
  - `rememberMe`: optional boolean, defaulting to `false`.

## Implementation Details

- Add `import { z } from "zod";` at the top of `src/lib/zodSchema.ts`.
- Use `z.string().trim().min(...)` so accidental leading/trailing whitespace does not pass validation.
- Use `z.coerce.boolean()` for `rememberMe` so checkbox inputs can submit as strings like `"true"`/`"false"` or `"on"`.
- Validate `passwordConfirmation` with `.refine((value, context) => value === context.password, { message: "Passwords do not match", path: ["passwordConfirmation"] })`.
- Export inferred types:
  - `export type LoginSchema = z.infer<typeof loginSchema>;`
  - `export type RegisterSchema = z.infer<typeof registerSchema>;`

## Validation Checklist

- `bun lint`
- `bun run build`

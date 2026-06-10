---
name: DB migration TTY issue
description: drizzle-kit push fails in non-interactive shells when column renames are detected
---

`drizzle-kit push` detects renamed columns and prompts interactively (rename vs. drop+create). This fails in CI/non-TTY shells with "Interactive prompts require a TTY terminal" error.

**Why:** drizzle-kit's columnsResolver requires user input to disambiguate renames from drop+add.

**How to apply:** For column renames, use raw SQL instead:
```sql
ALTER TABLE users RENAME COLUMN clerk_id TO user_id;
```
Run via `executeSql` in the code_execution sandbox (has DB access via DATABASE_URL). For new columns or table creates (no ambiguity), `drizzle-kit push` works fine.

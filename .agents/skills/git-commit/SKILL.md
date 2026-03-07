# Git Commit Conventions — Tastik

Use this skill whenever you need to write a git commit message for the Tastik repo.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

All commits are validated by commitlint against `@commitlint/config-conventional` plus these extra rules:
- Subject: sentence-case, max 72 characters, no trailing period, imperative mood
- Body lines: max 100 characters

---

## Allowed Types

| Type | When to use |
|------|-------------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructure, no feature or bug change |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `chore` | Tooling, deps, config, build scripts |
| `ci` | CI/CD pipeline changes |
| `build` | Build system or bundler changes |
| `revert` | Revert a previous commit |

---

## Scope (optional)

Lowercase noun describing the area changed. Use one of these or omit if too broad:

- `auth` — authentication flows, Better Auth
- `lists` — list CRUD, list types
- `items` — item CRUD, stepper/calculator logic
- `tags` — tag management
- `sharing` — list sharing, nicknames
- `subscriptions` — Stripe, billing
- `ui` — shared UI components, design tokens
- `convex` — backend functions, schema
- `deps` — dependency updates
- `e2e` — Playwright tests
- `hooks` — React hooks

---

## Subject Rules

- Sentence-case: capitalize first word only (unless it's a proper noun like "Stripe" or "OAuth")
- Imperative mood: "Add feature" not "Added feature" or "Adds feature"
- No trailing period
- Max 72 characters

---

## Body (optional)

- Separate from subject with a blank line
- Explain **why**, not what (the diff shows what)
- Wrap at 100 characters per line

---

## Breaking Changes

Append `!` after type/scope:

```
feat(auth)!: Replace OTP with magic links
```

Or add a footer:

```
BREAKING CHANGE: OTP login removed; users must use magic links or OAuth
```

---

## Examples

```
feat(lists): Add kanban board view
```

```
fix(items): Prevent duplicate stepper increments on double-tap
```

```
chore(deps): Upgrade Convex to 1.18.0
```

```
refactor(hooks): Extract subscription state into useBillingStatus

Avoids duplicating Stripe trial logic across three components.
The hook centralises isTrialing, trialDaysLeft, and planName.
```

```
feat(sharing)!: Require nickname confirmation before list access

BREAKING CHANGE: Shared list links now redirect to a nickname prompt
instead of granting immediate access.
```

---

## Verifying a Message Locally

```sh
# Lint the last commit
bunx commitlint --from HEAD~1

# Lint a message string directly
echo "feat(auth): Add magic link login" | bunx commitlint --stdin
```

# Authentication

- Passwordless authentication.
- Providers: email OTP, Google OAuth, Apple Sign In.
- OTP is rate-limited to 5 requests per hour.

# Subscription Model

- Billing provider: Clerk Billing (webhooks handled via Svix).
- Pricing:
  - Monthly: $1.99/month (7-day free trial)
  - Yearly: $19.92/year, equivalent to $1.66/month, save 17% (7-day free trial)
- Stored subscription status values: `inactive`, `active`, `past_due`, `canceled`.
- Trialing is derived from `status: active` + `freeTrial: true` + non-expired period.
- Freemium is active:
  - Free: up to 5 lists, up to 50 items/list, list types `simple` and `calculator` only, keyboard shortcuts included.
  - Pro: up to 50 lists, up to 500 items/list, all list types (simple, calculator, stepper, kanban, multi), sharing, and tags.
- Access is feature-gated by subscription checks where needed (not a global hard paywall).

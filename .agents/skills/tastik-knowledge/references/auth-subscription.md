# Authentication

- Passwordless authentication.
- Providers: email OTP, Google OAuth, Apple Sign In.
- OTP is rate-limited to 5 requests per hour.

# Subscription Model

- Billing provider: Clerk Billing.
- Stored subscription status values: `inactive`, `active`, `past_due`, `canceled`.
- Trialing is derived from `status: active` + `freeTrial: true` + non-expired period.
- Freemium is active:
  - Free: up to 5 lists, up to 50 items/list, list types `simple` and `calculator`.
  - Pro: up to 50 lists, up to 500 items/list, all list types, sharing, and tags.
- Access is feature-gated by subscription checks where needed (not a global hard paywall).

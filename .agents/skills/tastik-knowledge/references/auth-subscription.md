# Authentication

- Better Auth (via @convex-dev/better-auth).
- Passwordless authentication.
- Providers: email OTP, Google OAuth, Apple Sign In.
- OTP is rate-limited to 5 requests per hour.

# Subscription Model

- Billing provider: Stripe (via @convex-dev/stripe).
- Hard paywall: pay or don't use it.
- Pricing: $1.99/month or $19.99/year.
- Trials: Yearly 14-day; Monthly 7-day.
- Plan slug: `tastik_pro` (in `convex/lib/subscription.ts`).
- Stored subscription status values: `inactive`, `active`, `past_due`, `canceled`.
- Trialing: `status: active` or `trialing` with non-expired `currentPeriodEnd`.
- Access is gated by subscription; unsubscribed users cannot use the app.

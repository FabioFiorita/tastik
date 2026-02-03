# Authentication

- Passwordless authentication.
- Providers: email OTP, Google OAuth, Apple Sign In.
- OTP is rate-limited to 5 requests per hour.

# Subscription Model

- Payment processor: RevenueCat.
- States: `inactive`, `trialing`, `active`, `past_due`, `canceled`.
- Every query/mutation checks `requireSubscription()`.
- `requireSubscription()` verifies a subscription exists, status is `active` or `trialing`, and the current period has not expired.

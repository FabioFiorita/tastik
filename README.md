# Tastik

Lists without deadlines — a quiet companion app.

## Add a Stripe subscription

This app is open source. To add paid subscriptions:

1. Use the **stripe-subscription** skill in your AI assistant (e.g. Cursor).
2. The skill documents how to implement a full subscription flow: checkout, billing portal, paywall, and Convex integration.
3. It will guide you through adding a starter subscription setup matching this codebase's patterns.

---

  tastik/                          # Root repo
  ├── .git/
  ├── apps/
  │   ├── ios/                     # iOS app
  │   │   ├── Tastik.xcodeproj/
  │   │   ├── Tastik/
  │   │   └── ...
  │   └── web/                     # Web app
  │       ├── src/
  │       ├── public/
  │       ├── package.json
  │       ├── vite.config.ts       # Inside web
  │       └── tsconfig.json        # Inside web
  ├── convex/                      # Shared backend
  │   └── ...
  ├── .env.local                   # Root (for convex config)
  ├── package.json                 # Root workspace config
  └── README.md

# Permission Architecture

- All data operations are paywalled.
- Access chain: `requireAuth()` then `requireListAccess()` or `requireListOwner()` then `requireSubscription()`.
- Owner permissions: list, item, tag, and editor CRUD.
- Editor permissions: item CRUD, read-only tags, no list settings.
- Verify exact implementation in `convex/**` before changing behavior.

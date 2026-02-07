# Permission Architecture

- Access chain: `requireAuth()` then `requireListAccess()` or `requireListOwner()`.
- Subscription checks are applied for paid features/limits, not all operations.
- Owner permissions: list, item, tag, and editor CRUD.
- Editor permissions: item CRUD, read-only tags, no list settings.
- Privacy rule for sharing: owner can view full editor identity; editors should only see nickname-safe collaborator data.
- Verify exact implementation in `convex/**` before changing behavior.

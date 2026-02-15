# Permission Architecture

- Access chain: `requireAuth()` then `requireListAccess()` or `requireListOwner()`.
- Subscription required for all app access (hard paywall).
- Owner permissions: list, item, tag, and editor CRUD.
- Editor permissions: item CRUD, read-only tags, no list settings.
- Privacy rule for sharing: owner can view full editor identity; editors should only see nickname-safe collaborator data.
- Verify exact implementation in `convex/**` before changing behavior.

## List Actions Permissions

### Owner-only actions
- Share list (add/remove editors)
- Edit list details (name, type, icon)
- Delete list

### Editor actions
- Duplicate list (copy becomes owner's list; editors not copied)
- Item CRUD (create, update, toggle complete, delete)
- Assign tags to items (set tagId on items)
- Read-only tags (cannot create, edit, or delete tags)

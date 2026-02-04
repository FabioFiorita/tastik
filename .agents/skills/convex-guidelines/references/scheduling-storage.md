# Scheduling and File Storage

## Scheduling (Crons)

### Cron Configuration

Define scheduled jobs in `convex/crons.ts`:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every 5 minutes
crons.interval(
  "cleanup-expired-sessions",
  { minutes: 5 },
  internal.sessions.cleanup,
);

// Run at specific time (2 AM daily)
crons.cron(
  "daily-report",
  "0 2 * * *",  // Cron expression
  internal.reports.generateDaily,
);

export default crons;
```

### Cron Methods

**Only use `crons.interval` or `crons.cron`:**

```typescript
// ✅ CORRECT - interval
crons.interval(
  "job-name",
  { hours: 1 },  // or { minutes: 30 }, { seconds: 15 }
  internal.jobs.myJob,
);

// ✅ CORRECT - cron expression
crons.cron(
  "job-name",
  "0 0 * * *",  // Midnight daily
  internal.jobs.myJob,
);

// ❌ INCORRECT - deprecated methods
crons.hourly("job-name", internal.jobs.myJob);   // DON'T USE
crons.daily("job-name", internal.jobs.myJob);    // DON'T USE
crons.weekly("job-name", internal.jobs.myJob);   // DON'T USE
```

### Function References

**Always pass a FunctionReference, never the function directly:**

```typescript
import { internal } from "./_generated/api";

// ✅ CORRECT - use internal reference
crons.interval("cleanup", { hours: 1 }, internal.tasks.cleanup);

// ❌ INCORRECT - don't pass function directly
import { cleanup } from "./tasks";
crons.interval("cleanup", { hours: 1 }, cleanup);  // Type error
```

### Interval Options

```typescript
// Every 30 seconds
crons.interval("job", { seconds: 30 }, internal.jobs.job);

// Every 15 minutes
crons.interval("job", { minutes: 15 }, internal.jobs.job);

// Every 2 hours
crons.interval("job", { hours: 2 }, internal.jobs.job);
```

### Cron Expressions

Standard cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7) (Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Examples:

```typescript
// Every hour at minute 0
crons.cron("hourly", "0 * * * *", internal.jobs.hourly);

// Every day at 2:30 AM
crons.cron("daily", "30 2 * * *", internal.jobs.daily);

// Every Monday at 9 AM
crons.cron("weekly", "0 9 * * 1", internal.jobs.weekly);

// First day of month at midnight
crons.cron("monthly", "0 0 1 * *", internal.jobs.monthly);
```

### Scheduled Job Pattern

The scheduled function should be an internal mutation or action:

```typescript
// convex/jobs.ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const cleanup = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("sessions")
      .filter((q) => q.lt(q.field("expiresAt"), Date.now()))
      .collect();

    for (const session of expired) {
      await ctx.db.delete(session._id);
    }

    return null;
  },
});
```

## File Storage

### Uploading Files

Generate upload URL, upload file, store ID:

```typescript
// Step 1: Generate upload URL (mutation)
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Step 2: Client uploads file to URL
// (Client-side code using fetch/axios)

// Step 3: Store file ID (mutation)
export const saveFile = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.name,
      uploadedBy: (await ctx.auth.getUserIdentity())?.subject,
    });
    return null;
  },
});
```

### Getting File URLs

Use `ctx.storage.getUrl()` to get signed URL:

```typescript
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Returns signed URL or null if file doesn't exist
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

**Returns:**
- `string` - Signed URL (valid for 1 hour)
- `null` - File doesn't exist

### File Metadata

**Do not use deprecated `ctx.storage.getMetadata`.** Query `_storage` system table instead:

```typescript
// ❌ DEPRECATED
const metadata = await ctx.storage.getMetadata(storageId);

// ✅ CORRECT - Query system table
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});
```

Metadata includes:

```typescript
{
  _id: Id<"_storage">,
  _creationTime: number,
  contentType: string,     // e.g., "image/png"
  size: number,           // bytes
  sha256: string,         // file hash
}
```

### Deleting Files

```typescript
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete from storage
    await ctx.storage.delete(args.storageId);

    // Clean up references
    const files = await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    return null;
  },
});
```

### Blob Conversion

Convert to/from `Blob` for storage operations:

```typescript
// In an action - reading file
export const processFile = action({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get blob
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("File not found");

    // Convert to text
    const text = await blob.text();

    // Or convert to array buffer
    const buffer = await blob.arrayBuffer();

    // Process data...

    return null;
  },
});

// In an action - writing file
export const createFile = action({
  args: { content: v.string(), contentType: v.string() },
  handler: async (ctx, args) => {
    // Create blob
    const blob = new Blob([args.content], { type: args.contentType });

    // Store
    const storageId = await ctx.storage.store(blob);

    // Save reference via mutation
    await ctx.runMutation(internal.files.save, { storageId });

    return storageId;
  },
});
```

## Common Patterns

### File Upload Flow

```typescript
// 1. Client requests upload URL
const uploadUrl = await createUploadUrl();

// 2. Client uploads file
const result = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": file.type },
  body: file,
});
const { storageId } = await result.json();

// 3. Client saves file reference
await saveFile({ storageId, name: file.name });
```

### File Schema

```typescript
files: defineTable({
  storageId: v.id("_storage"),
  name: v.string(),
  contentType: v.string(),
  size: v.number(),
  uploadedBy: v.optional(v.string()),
})
  .index("by_storage_id", ["storageId"])
  .index("by_uploaded_by", ["uploadedBy"]),
```

### Scheduled Cleanup

```typescript
// Clean up orphaned files every day
crons.cron("cleanup-files", "0 3 * * *", internal.files.cleanupOrphaned);

export const cleanupOrphaned = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find all storage IDs in use
    const files = await ctx.db.query("files").collect();
    const inUse = new Set(files.map((f) => f.storageId));

    // Query all files in storage
    const allFiles = await ctx.db.system.query("_storage").collect();

    // Delete orphaned files
    for (const file of allFiles) {
      if (!inUse.has(file._id)) {
        await ctx.storage.delete(file._id);
      }
    }

    return null;
  },
});
```

## Best Practices

### Scheduling
1. **Use interval or cron only** - Don't use deprecated hourly/daily/weekly
2. **Pass FunctionReference** - Never pass function directly
3. **Use internal functions** - Scheduled jobs should be internal mutations/actions
4. **Handle failures gracefully** - Log errors, don't throw
5. **Keep jobs idempotent** - Safe to run multiple times

### File Storage
1. **Don't use getMetadata** - Query `_storage` system table instead
2. **Clean up references** - Delete database records when deleting files
3. **Validate file types** - Check content type before storing
4. **Use signed URLs** - They expire in 1 hour (security)
5. **Store metadata** - Keep name, type, size in your table
6. **Handle null URLs** - `getUrl()` returns null if file missing
7. **Use actions for processing** - Actions can read file contents

### Security
1. **Validate uploads** - Check file type and size limits
2. **Check permissions** - Verify user can upload/access files
3. **Sanitize filenames** - Clean user-provided names
4. **Use internal endpoints** - Don't expose storage IDs directly
5. **Audit access** - Log file downloads if needed

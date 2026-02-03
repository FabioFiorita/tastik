---
description: Capture an agent mistake and add a preventive rule to INSTRUCTIONS.md
argument-hint: "[optional: mistake description]"
---

# Capture Mistake

Capture an agent mistake and add a preventive rule to INSTRUCTIONS.md to prevent future occurrences.

## Context

- Current INSTRUCTIONS.md: !`cat .agents/INSTRUCTIONS.md`
- User input: $ARGUMENTS (if provided)

## Task

Follow this workflow to capture and document the mistake:

### 1. Understand the mistake

- If $ARGUMENTS provided, use that as the mistake description
- Otherwise, ask the user to describe what went wrong
- Review the conversation context to understand the full error

### 2. Check for existing rules

- Search INSTRUCTIONS.md for similar guidance
- If rule already exists, ask user if they want to strengthen/clarify it
- If no similar rule exists, proceed to formulate new one

### 3. Formulate the rule

Create a clear, actionable rule that:

- Describes what was done wrong (the mistake)
- Explains what should be done instead (the correct approach)
- Provides brief rationale (why this matters)
- Is specific enough to prevent recurrence
- Is general enough to apply to similar cases

### 4. Determine placement

Choose the best location in INSTRUCTIONS.md:

1. **First choice**: Add to existing relevant section if one exists:
   - Workflow section: Process or development flow mistakes
   - Frontend Standards: UI/React/Tailwind patterns and anti-patterns
   - Component Files: Component structure and organization mistakes
   - Convex Guidelines: Backend/database/API patterns
   - Constants and Utils: Code organization mistakes

2. **Second choice**: Create "Common Mistakes" section after "Post-Change Checks" if:
   - No existing section fits well
   - Mistake is cross-cutting
   - Mistake doesn't fit into existing categories

### 5. Format the rule

Use appropriate format based on placement:

**For existing sections (simple bullet format):**

```markdown
- **Never X** - always Y instead. [Reason]
```

**For Common Mistakes section (structured format):**

```markdown
#### [Short title describing the mistake]

**Mistake**: [What was done wrong]

**Correct approach**: [What should be done instead]

**Why**: [Brief rationale]
```

### 6. Update INSTRUCTIONS.md

- Use the Edit tool to add the rule to the chosen section
- If creating "Common Mistakes" section, add it after "Post-Change Checks"
- Maintain consistent formatting with rest of document (Markdown, 2 spaces)

### 7. Show and confirm

- Display the change to the user
- Ask if the rule is accurate and clear
- Make adjustments if needed

## Rule Format Examples

### Example 1: Frontend mistake (add to Frontend Standards section)

```markdown
- **Never use arbitrary Tailwind values in components** - use design tokens (`primary`, `muted`) or standard scales (`text-sm`, `size-5`). Create a CSS variable if a value is reused. [Reason: Arbitrary values create maintenance burden and break design system consistency]
```

### Example 2: Convex mistake (add to Convex Guidelines section)

```markdown
- **Never use filter() on Convex queries** - define an index and use `withIndex()` instead. [Reason: filter() doesn't scale and causes performance issues; indexes are required for efficient queries]
```

### Example 3: Workflow mistake (add to Workflow section)

```markdown
- **Never skip `bun check:write` before committing** - always run both `bun typecheck` and `bun check:write` to catch formatting and type errors. [Reason: CI will fail anyway; catching locally saves time]
```

## Verification Checklist

Before finalizing, ensure:

- [ ] Rule is clear and actionable
- [ ] Rule is placed in appropriate section
- [ ] Formatting matches document style
- [ ] Rule is specific enough to be useful
- [ ] Rule is general enough to apply to similar cases
- [ ] User confirms the rule is accurate

## Important Notes

- Keep rules concise - one rule per mistake
- Focus on prevention, not blame
- Make rules searchable (use clear keywords)
- Don't duplicate existing guidance
- Ask for confirmation before editing INSTRUCTIONS.md

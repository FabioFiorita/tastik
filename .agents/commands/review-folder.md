---
description: Analyze a folder for code quality, patterns, and missing tests, then create an improvement plan
argument-hint: "<folder-path>"
---

# Review Folder

Perform a comprehensive code review of a folder, identify issues, and create an actionable improvement plan.

## Context

- Project instructions: Use your AGENTS.md or CLAUDE.md
- Target folder: $ARGUMENTS

## Prerequisites

- $ARGUMENTS is **required**. If not provided, ask the user for the folder path before proceeding.
- Verify the folder exists before starting analysis.

## Resources & Tools

- **INSTRUCTIONS.md** — Follow project rules and conventions from `INSTRUCTIONS.md`. These are the ground truth for this codebase; every analysis and suggestion must align with them.
- **Skills** — Use available skills when relevant: `convex-guidelines` for Convex code, `testing-setup` for tests and mocks, domain skills (e.g. `tastik-knowledge`) for product context. Apply them proactively during exploration and analysis.
- **MCP** — When you need framework docs, API references, or external guidance, use all available MCP tools (e.g. TanStack docs, shadcn components, Clerk SDK snippets, web fetch). Prefer fetched documentation over assumptions.

## Task

### Phase 1: Explore

Thoroughly read every file in the target folder and its subfolders. Build a mental map of:

- All components, hooks, utilities, and their relationships
- Import/export graph (who depends on whom)
- Existing test files and their coverage

### Phase 2: Analyze

Evaluate the code against each category below. For each, note **specific** file:line references and concrete examples — never give vague feedback.

#### 2.1 DRY (Don't Repeat Yourself)

- Duplicated logic, markup, or styles across files
- Copy-pasted code that should be extracted into a shared helper or component
- Repeated conditional patterns that could be abstracted

#### 2.2 Clean Code & Readability

- Unclear naming (variables, functions, components, files)
- Functions doing too much (> ~30 lines or multiple responsibilities)
- Deep nesting (> 3 levels)
- Magic numbers or strings that should be named constants
- Dead code, unused imports, commented-out code

#### 2.3 Separation of Concerns

- Business logic mixed into UI components (should be in hooks)
- Data fetching or mutations directly in components (should be in hooks under `src/hooks/`)
- Presentation logic mixed with state management
- Components that are both smart (data-aware) and dumb (presentational)

#### 2.4 Prop Drilling & State Management

- Props passed through 3+ component levels without being used
- State that should be lifted up or pushed down
- Missing or unnecessary context providers
- Derived state that could be computed instead of stored

#### 2.5 Component Architecture

- Components that are too large (> 150 lines) and should be split
- Missing reusable components (repeated JSX patterns)
- Incorrect component boundaries
- Files exporting multiple components (should be one exported component per file)

#### 2.6 Over-Engineering

- Unnecessary abstractions (wrappers that add no value)
- Premature generalization (config objects, factories for single use cases)
- Excessive type gymnastics when simpler types would work
- Feature flags or backward-compatibility code that is no longer needed

#### 2.7 Under-Engineering

- Missing error handling at system boundaries
- Missing loading/empty/error states in UI
- Missing accessibility (aria labels, keyboard navigation, semantic HTML)
- Missing input validation where user data enters the system

#### 2.8 Testing

- Files with no corresponding test file
- Tests that exist but have poor coverage (missing edge cases, error paths)
- Tests that test implementation details instead of behavior
- Missing integration tests for complex interactions
- Mocks that are too loose or too tight

#### 2.9 Project Conventions (from INSTRUCTIONS.md)

- Violations of project-specific rules (design tokens, mobile-first, named exports, etc.)
- Hooks not following the project pattern (`src/hooks/queries/`, `src/hooks/actions/`)
- Missing `data-testid` attributes on interactive elements
- Direct Convex query calls in components instead of through hooks

### Phase 3: Create the Plan

Produce a structured improvement plan. Group actions by priority:

```
## Folder Review: `<folder-path>`

### Summary
<2-3 sentence overview of the folder's current state and main issues>

### Critical (fix now)
Issues that cause bugs, break conventions, or significantly hurt maintainability.

- [ ] **[Category]** `file:line` — Description of issue → Suggested fix

### Important (fix soon)
Issues that hurt readability, testability, or developer experience.

- [ ] **[Category]** `file:line` — Description of issue → Suggested fix

### Nice to Have (improve when touching the file)
Minor improvements and polish.

- [ ] **[Category]** `file:line` — Description of issue → Suggested fix

### Missing Tests
Files that need test coverage, with specific test cases to write.

- [ ] `file` — Test cases: [list specific scenarios to test]

### Positive Patterns
Things done well that should be maintained or replicated elsewhere.

- `file` — What's good about it
```

### Phase 4: Present and Iterate

- Present the plan to the user
- Ask if they want to:
  1. Start implementing fixes (ask which priority level to tackle first)
  2. Adjust the plan (remove/add items)
  3. Save the plan for later

## Important Notes

- Be specific: always include file paths and line numbers
- Be actionable: every issue must have a concrete suggested fix
- Be balanced: call out what's done well, not just problems
- Respect project conventions in INSTRUCTIONS.md — those are the ground truth for this codebase
- Do NOT start implementing changes without user approval
- Focus on the folder scope — don't review the entire codebase

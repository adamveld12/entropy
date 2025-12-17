---
status: complete
priority: p2
issue_id: "001"
tags: [code-review, typescript, type-safety]
dependencies: []
---

# Missing TypeScript Types for Motion.dev Variants

## Problem Statement

Animation variant objects (`stepVariants`, `stepTransition`) lack explicit TypeScript types, causing the compiler to infer `any` and losing type safety. This prevents validation of Motion.dev API usage and could lead to runtime errors from invalid configuration.

**Why it matters:**
- Type safety is lost for animation configurations
- Invalid ease values like "invalid-ease" would compile but fail at runtime
- No IDE autocomplete for valid Motion properties
- Violates project's TypeScript strict mode standards

## Findings

**Location:** `/Users/adam/code/mscleo/src/app/page.tsx:22-28`

**Current Code:**
```typescript
const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stepTransition = { duration: 0.3, ease: "easeOut" };
```

**Issue:** TypeScript infers generic object types, not Motion-specific types.

**Agent Finding:** typescript-reviewer identified missing `Variants` and `Transition` type imports from `motion/react`.

## Proposed Solutions

### Option 1: Import and Apply Motion Types (Recommended)
```typescript
import { AnimatePresence, motion, type Variants, type Transition } from "motion/react";

const stepVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stepTransition: Transition = {
  duration: 0.3,
  ease: "easeOut"
};
```

**Pros:**
- Full type safety and autocomplete
- Validates ease values against Motion's API
- Standard TypeScript best practice

**Cons:**
- None

**Effort:** Small (2 minutes)
**Risk:** None

### Option 2: Use `as const` Assertion
```typescript
const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const satisfies Variants;
```

**Pros:**
- Literal types preserved
- Slightly more precise

**Cons:**
- More verbose
- Doesn't add value over Option 1

**Effort:** Small
**Risk:** None

## Recommended Action

*To be filled during triage*

## Technical Details

**Affected Files:**
- `/Users/adam/code/mscleo/src/app/page.tsx` (lines 20-28)

**Components:**
- Module-level animation configuration

**Dependencies:**
- `motion` package (already installed)

**Database Changes:**
- None

## Acceptance Criteria

- [ ] Import `Variants` and `Transition` types from `motion/react`
- [ ] Apply types to `stepVariants` and `stepTransition` constants
- [ ] No TypeScript errors in project
- [ ] IDE autocomplete works for Motion properties

## Work Log

### 2025-12-16
**Action:** Finding identified during code review of Motion.dev animation implementation
**Learning:** Motion.dev exports TypeScript types for all configuration objects

## Resources

- **PR/Branch:** Current branch (main with uncommitted changes)
- **Related Issues:** Part of animation feature implementation
- **Documentation:** https://motion.dev/docs/react-motion-value#typescript
- **Similar Patterns:** All Motion configuration should use exported types

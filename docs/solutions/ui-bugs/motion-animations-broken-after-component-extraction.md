---
title: "Motion.dev animations broke after component extraction refactor"
problem_type: ui-bugs
severity: medium
components:
  - AnimatedStep
  - AnimatePresence
  - Wizard step transitions
symptoms:
  - No fade transitions between wizard steps
  - No slide animations on step changes
  - Silent failure (no console errors)
  - Animations worked pre-refactor, broke post-refactor
root_cause: "Missing initial/animate/exit props on motion.div after component extraction"
solution: "Add initial/animate/exit props to activate Motion.dev variants"
tags:
  - motion.dev
  - framer-motion
  - react
  - animations
  - refactoring
  - component-extraction
  - code-review
  - agent-error
date_encountered: 2025-12-16
fixed_in_commit: 1a20064
related_commits:
  - b027e12 (key prop fix)
  - f6ef88f (initial refactoring)
---

# Motion.dev Animations Broken After AnimatedStep Refactoring

## Problem Statement

After extracting a reusable `AnimatedStep` component to eliminate code duplication, all wizard step transitions stopped animating. Steps now snap instantly between states instead of smoothly fading and sliding. The component was created with properly defined `variants` but animations never activated.

**Impact:**
- No visual transitions between wizard steps (setup → questions → draw → reading)
- Poor user experience (jarring instant changes instead of smooth 300ms transitions)
- Silent failure (no errors, variants defined but unused)

## Symptoms Observed

1. **No animations on step transitions** - Instant content swaps with no fade or slide effects
2. **Variants defined but inactive** - `stepVariants` object present with `initial`, `animate`, `exit` states
3. **AnimatePresence configured correctly** - Parent `<AnimatePresence mode="wait">` working
4. **No console errors** - Motion.dev loaded successfully, no runtime warnings
5. **Key prop fixed but still broken** - First fix attempt (key placement) didn't resolve the issue

## Investigation Steps

### Attempt 1: Check `key` Prop Placement ❌

**Hypothesis:** AnimatePresence can't track components without proper `key` prop

**Action taken:**
- Moved `key` from inner `motion.div` to `AnimatedStep` component itself
- Changed `<AnimatedStep stepKey="setup">` → `<AnimatedStep key="setup">`

**Result:** Partially fixed - AnimatePresence now tracks component changes correctly, but animations still don't run

### Attempt 2: Verify Variants and Transition Config ✓

**Checked:**
```typescript
const stepVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stepTransition: Transition = {
  duration: 0.3,
  ease: "easeOut",
};
```

**Result:** Configuration correct but still not activating

### Attempt 3: Review Motion.dev Documentation ✅

**Discovery:** When using `variants` prop, Motion.dev requires explicit `initial`, `animate`, `exit` props to activate variant-based animations.

**Root cause identified:** Missing activation props on `motion.div`

## Root Cause Analysis

The failure was caused by a **cascade of misinformation** through the development workflow:

### The Cascade

1. **Code Review Agent Error (Origin)**

   The `code-simplicity-reviewer` agent incorrectly stated in `/Users/adam/code/mscleo/todos/003-complete-p2-extract-animated-step-component.md:44`:

   ```
   **Additional Finding:** The props `initial="initial"`, `animate="animate"`,
   `exit="exit"` are redundant—Motion.dev defaults these when using variants.
   ```

   **This claim is FALSE.** Motion.dev requires these props to activate variants.

2. **Todo File Propagation**

   - The incorrect "Additional Finding" was added to the todo file
   - Proposed solution (lines 58-72) omitted the required props based on this misinformation
   - Todo became the implementation spec for the refactoring agent

3. **Implementation from Bad Instructions**

   - Refactoring agent followed the todo instructions exactly as written
   - Created `AnimatedStep.tsx` without `initial`/`animate`/`exit` props
   - Component had variants defined but no mechanism to activate them

4. **Silent Runtime Failure**

   - Motion.dev doesn't throw errors when variants are unused
   - Animations simply don't happen - component renders instantly
   - No developer feedback that configuration is incomplete

### Why This Happened

**Agent Hallucination:** The `code-simplicity-reviewer` made an incorrect assumption about Motion.dev's API. It likely confused:
- What variants DO: Centralize animation definitions in an object
- What variants DON'T DO: Automatically activate without explicit state props

**Motion.dev Design:** The library uses `variants` as an animation dictionary but requires `initial`, `animate`, `exit` props to specify which variant states to use at each lifecycle stage. This design allows:
- Multiple variant configurations per component
- Conditional variant selection based on props
- Explicit control over animation lifecycle

Without activation props, Motion has no way to know which variant to apply or when.

## Working Solution

### Before (Broken Code)

```typescript
// src/components/AnimatedStep.tsx (broken)
export function AnimatedStep({ children }: AnimatedStepProps) {
  return (
    <motion.div
      variants={stepVariants}  // ❌ Defined but never activated
      transition={stepTransition}
    >
      {children}
    </motion.div>
  );
}
```

### After (Working Code)

```typescript
// src/components/AnimatedStep.tsx (fixed)
export function AnimatedStep({ children }: AnimatedStepProps) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"    // ✅ Activates initial variant state
      animate="animate"    // ✅ Activates animate variant state
      exit="exit"          // ✅ Activates exit variant state (for AnimatePresence)
      transition={stepTransition}
    >
      {children}
    </motion.div>
  );
}
```

### The Fix

Add three props to `motion.div`:

- `initial="initial"` - Use the `initial` variant (opacity: 0, y: 20) on mount
- `animate="animate"` - Animate to the `animate` variant (opacity: 1, y: 0)
- `exit="exit"` - Animate to the `exit` variant (opacity: 0, y: -20) on unmount

**Why string values?** The strings `"initial"`, `"animate"`, `"exit"` reference keys in the `stepVariants` object. Motion uses these to look up which animation config to apply at each stage.

## Verification

**Test:** Navigate through all wizard steps (setup → questions → draw → reading)

**Expected behavior:**
- ✅ Fade in with upward slide on entry (opacity 0→1, y 20→0)
- ✅ Smooth 0.3s transition with easeOut easing
- ✅ Fade out with upward slide on exit (opacity 1→0, y 0→-20)
- ✅ No layout shift (AnimatePresence mode="wait" ensures sequential transitions)

## Prevention Strategies

### 1. Validate Agent API Claims

**Before accepting library API advice:**
- ✅ Check official documentation for the exact version installed
- ✅ Use Context7 MCP to fetch authoritative API reference
- ✅ Search codebase for existing usage patterns
- ✅ Read TypeScript type definitions to verify prop requirements

**Example:**
```typescript
// If agent claims a prop is "redundant", verify by checking the type
import { motion } from "motion/react";
// Hover over motion.div in VSCode to see required props
```

### 2. Test Immediately After Refactoring

**Visual regression testing:**
```bash
# Run build to catch type errors
npm run build

# Manually test animations work
# Or use Playwright for visual regression
```

### 3. Cross-Reference Documentation

**When refactoring animation code:**
- Visit https://motion.dev/docs/react-animate-presence
- Check official examples for variant usage patterns
- Verify against TypeScript types in `node_modules/motion/types`

### 4. Agent Prompt Improvement

**Add to review agent prompts:**
```
Before claiming props are redundant:
1. Read the library's TypeScript interface
2. Cite official documentation URL
3. Check if this pattern exists elsewhere in codebase
4. For animation libraries, test that animations actually run
```

## Lessons Learned

1. **Verify agent claims against official docs** - Even specialized review agents can hallucinate API behavior
2. **Motion.dev variants require activation** - `variants` alone is insufficient; must specify `initial`/`animate`/`exit`
3. **Silent failures are dangerous** - Animation libraries often fail gracefully (no errors), making bugs harder to detect
4. **Test visual behavior immediately** - Refactoring should include visual verification, not just type checking
5. **Agent review quality varies** - The `code-simplicity-reviewer` provided incorrect guidance that cascaded through the workflow

## Related Issues

- Commit `f6ef88f` - Initial refactoring that introduced the bug
- Commit `b027e12` - First fix attempt (key prop placement)
- Commit `1a20064` - Actual fix (adding initial/animate/exit props)
- Todo file `/Users/adam/code/mscleo/todos/003-complete-p2-extract-animated-step-component.md` - Contains the incorrect "Additional Finding"

## References

- [Motion.dev Variants Documentation](https://motion.dev/docs/react-variants)
- [AnimatePresence API](https://motion.dev/docs/react-animate-presence)
- [Motion TypeScript Types](https://github.com/framer/motion/blob/main/packages/framer-motion/src/motion/types.ts)

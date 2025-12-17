---
status: complete
priority: p2
issue_id: "003"
tags: [code-review, code-quality, dry, simplicity]
dependencies: []
---

# Extract AnimatedStep Component to Eliminate Duplication

## Problem Statement

Four identical `motion.div` wrappers repeat the same props across all wizard steps (setup, questions, draw, reading). Each wrapper has 6 identical props totaling 24 prop assignments. This violates DRY principle and makes animation changes require updates in 4 locations.

**Why it matters:**
- Code duplication makes maintenance harder
- Changing animation timing requires 4 edits
- Risk of inconsistency if one wrapper diverges
- Reduces code by ~20 lines

## Findings

**Location:** `/Users/adam/code/mscleo/src/app/page.tsx:304-405`

**Current Pattern (repeated 4x):**
```typescript
<motion.div
  key="setup"  // or "questions", "draw", "reading"
  variants={stepVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={stepTransition}
>
  {/* Step content */}
</motion.div>
```

**Agent Findings:**
- code-simplicity-reviewer: "4 identical motion.div wrappers violate DRY principle"
- pattern-recognition-specialist: "Extractable into shared component"
- architecture-strategist: "Current pattern doesn't scale"

**Additional Finding:** The props `initial="initial"`, `animate="animate"`, `exit="exit"` are redundant—Motion.dev defaults these when using variants.

## Proposed Solutions

### Option 1: Create AnimatedStep Wrapper Component (Recommended)
```typescript
// New file: /src/components/AnimatedStep.tsx
import { motion } from "motion/react";

interface AnimatedStepProps {
  children: React.ReactNode;
  step: string;
}

export function AnimatedStep({ children, step }: AnimatedStepProps) {
  return (
    <motion.div
      key={step}
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Usage in page.tsx:
<AnimatePresence mode="wait">
  {!sharedReading && !viewingHistory && wizard.state.step === "setup" && (
    <AnimatedStep step="setup">
      <SetupStep {...props} />
      <ReadingHistory {...props} />
    </AnimatedStep>
  )}
  {/* Repeat for other steps */}
</AnimatePresence>
```

**Pros:**
- Single source of truth for animations
- 20 lines saved
- Easy to modify animation timing
- Props simplified (no redundant initial/animate/exit)

**Cons:**
- Adds new file
- Slight indirection

**Effort:** Small (15 minutes)
**Risk:** None

### Option 2: Create Inline Helper Function
```typescript
const AnimatedStep = ({ children, step }: { children: ReactNode; step: string }) => (
  <motion.div key={step} variants={stepVariants} transition={stepTransition}>
    {children}
  </motion.div>
);
```

**Pros:**
- No new file
- Still reduces duplication

**Cons:**
- Function defined in page.tsx (less reusable)
- Still references module-level constants

**Effort:** Small
**Risk:** None

### Option 3: Use Single Motion.div with Conditional Children
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={wizard.state.step}
    variants={stepVariants}
    transition={stepTransition}
  >
    {wizard.state.step === "setup" && !sharedReading && !viewingHistory && (
      <><SetupStep {...} /><ReadingHistory {...} /></>
    )}
    {wizard.state.step === "questions" && !sharedReading && (
      <QuestionsStep {...} />
    )}
    {/* etc */}
  </motion.div>
</AnimatePresence>
```

**Pros:**
- Most DRY (single wrapper)
- Simplest structure

**Cons:**
- Loses per-step key specificity
- Conditional logic inside wrapper may be less clear

**Effort:** Small
**Risk:** Low (animation still works but key changes behavior slightly)

## Recommended Action

*To be filled during triage*

## Technical Details

**Affected Files:**
- `/Users/adam/code/mscleo/src/app/page.tsx` (lines 302-407)
- New file: `/Users/adam/code/mscleo/src/components/AnimatedStep.tsx` (if Option 1)

**Components:**
- All wizard step wrappers

**Dependencies:**
- `motion/react`

**Database Changes:**
- None

## Acceptance Criteria

- [ ] AnimatedStep component created (or alternative solution)
- [ ] All 4 steps use new component/pattern
- [ ] Animation behavior unchanged
- [ ] Code reduction of ~20 lines
- [ ] No TypeScript errors
- [ ] Tests pass (if applicable)

## Work Log

### 2025-12-16
**Action:** Finding identified during code review by multiple agents
**Learning:** DRY principle applies to React component patterns; extracting wrappers improves maintainability

## Resources

- **PR/Branch:** Current branch (main with uncommitted changes)
- **Related Issues:** Part of animation implementation cleanup
- **Documentation:** React component composition patterns
- **Similar Patterns:** Other projects extract animation wrappers (e.g., NextUI's `AnimatedLayout`)

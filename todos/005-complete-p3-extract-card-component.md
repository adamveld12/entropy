---
status: complete
priority: p3
issue_id: "005"
tags: [code-review, dry, code-quality]
dependencies: []
---

# Extract Duplicated Card Rendering into TarotCard Component

## Problem Statement

Card rendering logic is duplicated across `DrawStep.tsx` and `ReadingStep.tsx` with identical structure (14 lines, 106 tokens). This represents 1.48% of the TypeScript codebase duplication and violates DRY principle.

**Why it matters:**
- Changes to card display require updates in 2 files
- Risk of visual inconsistency if one diverges
- Harder to maintain styling
- Potential source of bugs if only one location updated

## Findings

**Locations:**
- `/Users/adam/code/mscleo/src/components/DrawStep.tsx:28-42`
- `/Users/adam/code/mscleo/src/components/ReadingStep.tsx:83-96`

**Duplicated Code:**
```tsx
<div className="bg-slate-800 rounded-lg p-4 space-y-2 w-48">
  <img
    src={card.image}
    alt={card.name}
    className={`w-full h-auto rounded ${card.reversed ? "transform rotate-180" : ""}`}
  />
  <div className="text-center">
    <p className="text-amber-500 font-semibold text-sm">{card.name}</p>
    {card.reversed && (
      <p className="text-slate-400 text-xs italic">Reversed</p>
    )}
    <p className="text-slate-300 text-xs mt-1">{card.meaning}</p>
  </div>
</div>
```

**Agent Finding:** pattern-recognition-specialist identified this as extractable duplication.

## Proposed Solutions

### Option 1: Extract to Shared TarotCard Component (Recommended)
```typescript
// New file: /src/components/TarotCard.tsx
import type { DrawnCard } from "@/lib/types";

interface TarotCardProps {
  card: DrawnCard;
  className?: string;
}

export function TarotCard({ card, className = "" }: TarotCardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg p-4 space-y-2 w-48 ${className}`}>
      <img
        src={card.image}
        alt={card.name}
        className={`w-full h-auto rounded ${card.reversed ? "transform rotate-180" : ""}`}
      />
      <div className="text-center">
        <p className="text-amber-500 font-semibold text-sm">{card.name}</p>
        {card.reversed && (
          <p className="text-slate-400 text-xs italic">Reversed</p>
        )}
        <p className="text-slate-300 text-xs mt-1">{card.meaning}</p>
      </div>
    </div>
  );
}

// Usage in DrawStep.tsx and ReadingStep.tsx:
<TarotCard card={card} />
```

**Pros:**
- Single source of truth
- Easy to update styling
- Type-safe with DrawnCard interface
- Reusable for future features

**Cons:**
- Adds new file
- Slight indirection

**Effort:** Small (15 minutes)
**Risk:** None

### Option 2: Keep Duplication (Not Recommended)
Keep current structure as-is.

**Pros:**
- No changes needed
- Each component self-contained

**Cons:**
- Continued duplication
- Maintenance burden
- Risk of inconsistency

**Effort:** Zero
**Risk:** Medium (technical debt)

## Recommended Action

*To be filled during triage*

## Technical Details

**Affected Files:**
- `/Users/adam/code/mscleo/src/components/DrawStep.tsx` (lines 28-42)
- `/Users/adam/code/mscleo/src/components/ReadingStep.tsx` (lines 83-96)
- New file: `/Users/adam/code/mscleo/src/components/TarotCard.tsx`

**Components:**
- DrawStep (card display in draw phase)
- ReadingStep (card display in final reading)

**Dependencies:**
- None (uses existing types)

**Database Changes:**
- None

## Acceptance Criteria

- [ ] TarotCard component created
- [ ] DrawStep updated to use TarotCard
- [ ] ReadingStep updated to use TarotCard
- [ ] Visual appearance unchanged
- [ ] All card states render correctly (normal, reversed)
- [ ] TypeScript compilation succeeds
- [ ] No visual regression

## Work Log

### 2025-12-16
**Action:** Finding identified during pattern recognition analysis
**Learning:** Ripgrep detected 14-line duplication across 2 files representing card rendering logic

## Resources

- **PR/Branch:** Current branch (main with uncommitted changes)
- **Related Issues:** Code quality improvement
- **Documentation:** React component composition patterns
- **Similar Patterns:** Extract presentational components for reusable UI elements

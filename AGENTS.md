# AGENTS.md

## Code Review Agents - When to Use

| Agent | Use When | Catches |
|-------|----------|---------|
| `data-integrity-guardian` | **Any DB migration/schema change** | Migration failures, data loss risks |
| `typescript-reviewer` | React state, async patterns, types | Race conditions, missing error handling |
| `security-sentinel` | APIs, auth, user input | Validation gaps, rate limiting |
| `architecture-strategist` | Multi-file changes, new features | Coupling, error handling consistency |
| `code-simplicity-reviewer` | After implementation complete | Silent failures, redundant code |
| `performance-oracle` | Data fetching, loading states | Waterfall patterns, missing UX feedback |

## Parallel Review Pattern

Launch 5-6 review agents **in single message** for comprehensive coverage:

```
After implementing feature:
→ typescript-reviewer + security-sentinel + architecture-strategist +
  code-simplicity-reviewer + performance-oracle + data-integrity-guardian
```

Each catches different issue types. Synthesize by severity (P1/P2/P3).

## Agent Limitations

**General-purpose agents hallucinate file paths** when summarizing changes. Specialized review agents are more accurate - they read actual files.

## Key Lesson

`data-integrity-guardian` caught that a NOT NULL migration would fail on existing data. **Always include for database changes.**

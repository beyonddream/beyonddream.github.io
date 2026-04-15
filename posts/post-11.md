---
title: "How FreeRouter's 14-Dimension Classifier Saves 60-80%"
date: 2026-04-13
---

[[toc]]

## Introduction

Below you will find info on how freerouter determines which model to call for answering user query based on online classifier run on the user query. The version used is v1.3.0 (https://github.com/openfreerouter/freerouter/tree/main/src/router) and I have used LLM assistance in helping me with this analysis. While I have cross verified the source code to make sure the analysis is accurate it is possible some error could have crept up so take it with a pinch of salt and do your own verification. I am motivated to undertake this analysis because I am building a port of the classifier in a different language with more sophistication planned in future.

## The Cost Arithmetic
- **No routing**: Every message hits expensive Claude Opus (~$75/M output tokens) = ~$50/day
- **With FreeRouter**: ~$10-15/day (saves 60-80%)
- **Why**: Most messages are simple and route to cheap models (Kimi K2.5 at near-zero cost)

## How the Classifier Works

Each message is scored across 14 dimensions (each ranges -1.0 to +1.0):

| Dimension | Purpose | Example |
|-----------|---------|---------|
| **Token count** | Message length | "hello" = -1.0, 500+ words = +1.0 |
| **Reasoning markers** | Logic keywords (highest weight: 0.25) | "prove", "derive", "theorem" |
| **Code presence** | Programming difficulty | Simple JS = +0.5, complex DSL = +1.0 |
| **Technical terms** | Specialized knowledge | "distributed systems", "cryptography" |
| **Simple indicators** | Pushes to cheap tier (weight: -1.0) | "what is", "define", "hello" |
| **Multi-step patterns** | Procedural complexity | "step 1...step 2...step 3" |
| **Domain specificity** | Domain expertise needed | Medicine, finance, law |
| **Reasoning depth** | Logical steps required | Yes/no question = low, proof = high |
| **Creativity level** | Novel generation needed | Brainstorm = high, factual = low |
| **Constraint indicators** | Optimization difficulty | Edge cases, performance requirements |
| **Question complexity** | Composition depth | Simple Q&A vs. nested logic |
| **Imperative verbs** | Action complexity | "explain" vs. "architect" |
| **Output format** | Structure needed | Plain text vs. structured JSON |
| **Negation complexity** | Logical inversions | Double negatives increase complexity |
| **Reference complexity** | Context dependencies | Needs prior conversation context |

## Weighted Scoring & Routing

Each dimension gets multiplied by a weight (all sum to 1.0), producing a **final complexity score** [0.0-1.0]:

| Score Range | Tier | Model | Cost |
|-----------|------|-------|------|
| < 0.3 | **SIMPLE** | Kimi K2.5 | ~$0.01/msg |
| 0.3-0.6 | **MEDIUM** | Claude Sonnet | ~$0.10/msg |
| 0.6-0.8 | **COMPLEX** | Claude Opus | ~$0.75/msg |
| ≥ 0.8 | **REASONING** | Claude Opus + thinking | ~$1.50/msg |

## Why This Saves 60-80%

**Distribution Reality**: Most user queries are simple:
- "What's 2+2?" → Score 0.1 → SIMPLE tier ($0.01)
- "Translate this" → Score 0.2 → SIMPLE tier ($0.01)
- "How do I...?" → Score 0.25 → SIMPLE tier ($0.01)

Only ~5-10% of messages need Opus. The weighted system ensures **the majority traffic hits near-zero-cost models**.

**Key Optimization**: Reasoning markers (0.25 weight) are heavily weighted because they're the clearest signal a message needs serious thinking—so messages without them default to cheap models.

## Example: Cost Impact

```
100 daily messages:
  80 simple queries       @ $0.01/msg = $0.80
  15 medium tasks         @ $0.10/msg = $1.50
   5 complex problems     @ $0.75/msg = $3.75
                                      ____________
  Total: ~$6 vs. $50 (all Opus) = 88% savings
```

This is why they claim 60-80%—most real-world traffic is simple questions and definitions that don't need expensive reasoning.

## Key Implementation Details

### Dimension Weights
```js
dimensionWeights: {
  tokenCount: 0.04,
  codePresence: 0.12,
  reasoningMarkers: 0.25,      ← Highest weighted
  technicalTerms: 0.18,
  creativeMarkers: 0.05,
  simpleIndicators: 0.08,
  multiStepPatterns: 0.10,
  questionComplexity: 0.04,
  imperativeVerbs: 0.03,
  constraintCount: 0.02,
  outputFormat: 0.03,
  referenceComplexity: 0.02,
  negationComplexity: 0.02,
  domainSpecificity: 0.04,
  agenticTask: 0.01,
}
```

### Tier Boundaries
```js
tierBoundaries: {
  simpleMedium: 0.3,      // Score < 0.3 → SIMPLE
  mediumComplex: 0.6,     // 0.3-0.6 → MEDIUM
  complexReasoning: 0.8,  // 0.6-0.8 → COMPLEX
},                         // Score >= 0.8 → REASONING
```

### Weighted Score Calculation
```js
weightedScore = 0
for each dimension:
  weightedScore += dimension.score × dimension.weight
```

Final score determines which tier (and thus which model) processes the message.

## The Routing Decision Flow

1. **Extract 14 dimensions** from message (keywords, token count, patterns)
2. **Calculate weighted sum** using predefined weights
3. **Map to tier** based on boundaries (0.3, 0.6, 0.8)
4. **Select model** from tier config (Kimi, Sonnet, Opus, etc.)

## Mode Overrides (v1.3.0)

Users can override classification with prefixes:
- `/simple What's 2+2?` → Forces SIMPLE tier
- `/max Complex architecture question` → Forces REASONING tier
- `[complex] Refactor this module` → Forces COMPLEX tier
- `deep mode: Why does this loop fail?` → Forces REASONING tier

The prefix is stripped before sending to the LLM.

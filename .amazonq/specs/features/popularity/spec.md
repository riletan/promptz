# Feature Specification: Prompt Popularity Tracking

## Problem Description

Users currently have no way to identify which prompts are most popular or useful. This limits content discovery and makes it difficult to surface valuable prompts to the community.

## Proposed Solution

### Overview

Implement a popularity tracking system that:

- Tracks user interactions (copies, stars) in real-time
- Calculates a popularity score daily
- Displays popularity through visual indicators
- Showcases popular prompts on the landing page

### Technical Design

#### 1. Data Model Changes

```
// app/lib/definitions.ts
interface Prompt {
  // ... existing fields ...
  copyCount: number;
  starCount: number;
  popularityScore: number;
}

// Schema changes in data/schema.ts
const schema = a.schema({
  Prompt: a.model({
    // ... existing fields ...
    copyCount: a.integer().required().defaultValue(0),
    starCount: a.integer().required().defaultValue(0),
    popularityScore: a.float().required().defaultValue(0),
  }).secondaryIndexes((index) => [
    index("popularityScore")  // For efficient querying of popular prompts
  ])
});
```

#### 2. Event Processing Architecture

_Async Counter Updates_

- EventBridge rule triggers Step Function for each interaction event
- Step Function Workflow ( prompt-interaction-count.asl.json):

```json
{
  "StartAt": "DetermineEventType",
  "States": {
    "DetermineEventType": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.detail.eventType",
          "StringEquals": "PromptCopied",
          "Next": "IncrementCopyCount"
        },
        {
          "Variable": "$.detail.eventType",
          "StringEquals": "PromptStarred",
          "Next": "IncrementStarCount"
        },
        {
          "Variable": "$.detail.eventType",
          "StringEquals": "PromptUnstarred",
          "Next": "DecrementStarCount"
        }
      ]
    },
    "IncrementCopyCount": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:updateItem",
      "Parameters": {
        "TableName": "${PromptTable}",
        "Key": {
          "id": { "S.$": "$.detail.promptId" }
        },
        "UpdateExpression": "SET copyCount = copyCount + :inc",
        "ExpressionAttributeValues": {
          ":inc": { "N": "1" }
        }
      },
      "End": true
    },
    "IncrementStarCount": {
      // Similar to IncrementCopyCount
    },
    "DecrementStarCount": {
      // Similar but with -1
    }
  }
}
```

_Daily Popularity Score Calculation_

- EventBridge scheduled rule triggers at 01:00 AM daily
- Step Function Workflow for recalculation:

```json
{
  "StartAt": "ScanPrompts",
  "States": {
    "ScanPrompts": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:scan",
      "Parameters": {
        "TableName": "${PromptTable}"
      },
      "Next": "ProcessPrompts"
    },
    "ProcessPrompts": {
      "Type": "Map",
      "ItemsPath": "$.Items",
      "Iterator": {
        "StartAt": "CalculateScore",
        "States": {
          "CalculateScore": {
            "Type": "Task",
            "Resource": "arn:aws:states:::dynamodb:updateItem",
            "Parameters": {
              "TableName": "${PromptTable}",
              "Key": {
                "id": { "S.$": "$.id" }
              },
              "UpdateExpression": "SET popularityScore = :score",
              "ExpressionAttributeValues": {
                ":score": {
                  "N.$": "States.MathAdd(States.MathMultiply($.copyCount, 2), $.starCount)"
                }
              }
            },
            "End": true
          }
        }
      },
      "End": true
    }
  }
}
```

#### 3. UI Implementation

_Popular Prompts Section_

```typescript
// app/ui/prompts/popular-prompts.tsx
async function PopularPrompts() {
  const prompts = await getPopularPrompts(3); // Fetch top 3 prompts

  return (
    <section className="mt-8">
      <h2>Popular Prompts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prompts.map(prompt => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
```

_Popularity Indicator Component_

```typescript
// app/ui/common/popularity-indicator.tsx
interface PopularityIndicatorProps {
  score: number;
}

export function PopularityIndicator({ score }: PopularityIndicatorProps) {
  const flames = score > 20 ? 3 : score > 10 ? 2 : score > 5 ? 1 : 0;

  return (
    <div
      className="flex gap-1"
      title={`Popularity Score: ${score}`}
      aria-label={`Popularity Score: ${score}`}
    >
      {Array(flames).fill(0).map((_, i) => (
        <FlameIcon key={i} className="h-4 w-4 text-orange-500" />
      ))}
    </div>
  );
}

```

### Testing Strategy

1. Unit Tests like

```typescript
// /ui/common/__test__/popularity-indicator.test.tsx
import { describe, expect, test } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { PopularityIndicator } from "@/app/ui/popularity-indicator";

describe("PopularityIndicator", () => {
  test("displays correct number of flames based on score", () => {
    const { container } = render(<PopularityIndicator score={15} />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  test("includes score in tooltip", () => {
    render(<PopularityIndicator score={15} />);
    expect(screen.getByTitle("Popularity Score: 15")).toBeInTheDocument();
  });
});
```

2. Integration Tests:

- Test event processing workflow with sample event
- Verify counter updates in database
- Test daily recalculation workflow
- Verify popularity score calculation

E2E Tests:

- Verify popular prompts display on landing page
- Test flame indicators visibility
- Verify tooltip functionality

## Performance Considerations

- Expected volume: 10 events per day (low load)
- No caching required per spec
- No rate limiting needed per spec
- Index on popularityScore for efficient queries

## Implementation Plan

Phase 1: Data Model & Infrastructure

- Update Prompt schema with new fields
- Add secondary index
- Deploy Step Functions workflows

Phase 2: Event Processing

- Implement counter update workflow
- Implement daily recalculation workflow
- Set up EventBridge rules

Phase 3: UI Components

- Create PopularityIndicator component
- Implement Popular Prompts section
- Add tooltips

Phase 4: Testing & Monitoring

- Implement test suite
- Set up CloudWatch dashboard for workflow monitoring

## Additional Context

- All interactions are considered for all-time scoring
- No decay factor for older interactions
- Popular prompts display below PromptSpotlight component
- Static flame indicators with tooltips
- No caching or rate limiting required due to low volume

# Prompt Popularity Tracking Implementation Plan

This document outlines the step-by-step implementation plan for adding popularity tracking to prompts in the Promptz application. Each step is designed to be small, testable, and build incrementally on previous work.

## Step 1: Update Data Model

```
Role: AWS Amplify Backend Developer
Main Task: Update the data model to support popularity tracking for prompts.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the Prompt model in `amplify/data/resource.ts` to add copyCount, starCount, and popularityScore fields.
5. Add a secondary index on popularityScore for efficient querying.
6. Update the `app/lib/definitions.ts` file to include the new fields in the Prompt interface.
7. Write unit tests to verify the updated data model.
Goal: Create a data model that supports tracking prompt popularity metrics.
Constraints: Follow Amplify Gen 2 data modeling best practices and project rules.
```

## Step 2: Implement Step Function for Interaction Counting

```
Role: AWS Step Functions Developer
Main Task: Implement the Step Function workflow for counting prompt interactions.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the `amplify/workflows/statemachines/prompt-interaction-count.asl.json` file with the workflow for processing prompt interactions.
5. Implement logic to handle different event types (PromptCopied, PromptStarred, PromptUnstarred).
6. Add DynamoDB update actions to increment or decrement the appropriate counters.
7. Test the workflow with sample events to ensure it correctly updates the counters.
Goal: Create a functional Step Function workflow that processes prompt interaction events and updates the appropriate counters in DynamoDB.
Constraints: Follow AWS Step Functions best practices and ensure error handling.
```

## Step 3: Configure Event Rules for Prompt Interactions

```
Role: AWS EventBridge Developer
Main Task: Configure EventBridge rules to trigger the Step Function workflow.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the `amplify/workflows/resources.ts` file to add EventBridge rules for all prompt interaction events.
5. Configure the rules to target the prompt-interaction-count Step Function.
6. Ensure all event types (PromptCopied, PromptStarred, PromptUnstarred) are properly handled.
7. Test the event rules to verify they correctly trigger the Step Function.
Goal: Configure EventBridge rules that trigger the Step Function workflow for each prompt interaction event.
Constraints: Follow AWS EventBridge best practices and ensure proper event pattern matching.
```

## Step 4: Implement Daily Popularity Score Calculation

```
Role: AWS Step Functions Developer
Main Task: Implement the Step Function workflow for daily popularity score calculation.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Create a new Step Function workflow file `amplify/workflows/statemachines/popularity-score-calculation.asl.json`.
5. Implement the workflow to scan the prompts table, calculate popularity scores, and update each prompt.
6. Update `amplify/workflows/resources.ts` to define and deploy the new Step Function.
7. Add an EventBridge scheduled rule to trigger the workflow daily at 01:00 AM.
8. Test the workflow with sample data to ensure it correctly calculates and updates popularity scores.
Goal: Create a scheduled workflow that calculates and updates popularity scores for all prompts on a daily basis.
Constraints: Follow AWS Step Functions best practices and ensure efficient processing of potentially large datasets.
```

## Step 5: Create Popularity Indicator Component

```
Role: React Frontend Developer
Main Task: Create a reusable component to display prompt popularity.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Create a new component `app/ui/common/popularity-indicator.tsx` that displays popularity using flame icons.
5. Implement logic to determine the number of flames based on the popularity score.
6. Add proper accessibility attributes (aria-label, title) for the popularity indicator.
7. Write unit tests for the component to verify it displays the correct number of flames for different scores.
Goal: Create a visually appealing and accessible component that indicates a prompt's popularity.
Constraints: Follow React best practices, ensure accessibility, and use Tailwind CSS for styling.
```

## Step 6: Update Prompt Card to Display Popularity

```
Role: React Frontend Developer
Main Task: Update the prompt card component to display popularity indicators.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the `app/ui/prompts/prompt-card.tsx` component to include the PopularityIndicator component.
5. Modify the component to pass the popularity score to the indicator.
6. Ensure the indicator is properly positioned and styled within the card layout.
7. Write unit tests to verify the prompt card correctly displays the popularity indicator.
Goal: Update the prompt card to visually indicate a prompt's popularity to users.
Constraints: Maintain the existing card design while integrating the new indicator.
```

## Step 7: Update Prompt Detail Page to Display Popularity

```
Role: React Frontend Developer
Main Task: Update the prompt detail page to display popularity information.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the `app/ui/prompts/prompt.tsx` component to include the PopularityIndicator component.
5. Add detailed popularity information (copy count, star count) to the prompt detail page.
6. Ensure the information is properly positioned and styled within the page layout.
7. Write unit tests to verify the prompt detail page correctly displays the popularity information.
Goal: Update the prompt detail page to show comprehensive popularity information.
Constraints: Maintain the existing page design while integrating the new information.
```

## Step 8: Implement Popular Prompts Component

```
Role: React Frontend Developer
Main Task: Create a component to display popular prompts.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Create a new component `app/ui/prompts/popular-prompts.tsx` that displays a list of popular prompts.
5. Implement a server action in `app/lib/actions/prompts.ts` to fetch popular prompts sorted by popularity score.
6. Style the component to match the application's design.
7. Write unit tests to verify the component correctly displays popular prompts.
Goal: Create a component that showcases popular prompts to users.
Constraints: Follow Next.js best practices for data fetching and component design.
```

## Step 9: Update Homepage to Display Popular Prompts

```
Role: React Frontend Developer
Main Task: Update the homepage to display popular prompts.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the `app/page.tsx` file to include the PopularPrompts component.
5. Position the component below the PromptSpotlight component as specified.
6. Ensure the layout is responsive and maintains the application's design.
7. Write unit tests to verify the homepage correctly displays the popular prompts section.
Goal: Update the homepage to showcase popular prompts to users.
Constraints: Maintain the existing homepage design while integrating the new section.
```

## Step 10: Add Sorting by Popularity to Prompt Search

```
Role: Full Stack Developer
Main Task: Add the ability to sort prompts by popularity in the search functionality.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Update the search parameters schema in `app/lib/definitions.ts` to include popularity as a sort option.
5. Modify the `searchPrompts` function in `app/lib/actions/prompts.ts` to support sorting by popularity score.
6. Update the search UI components to include popularity as a sort option.
7. Write unit tests to verify the search functionality correctly sorts prompts by popularity.
Goal: Enable users to sort prompts by popularity when searching.
Constraints: Maintain compatibility with existing search functionality.
```

## Step 11: Implement End-to-End Testing

```
Role: QA Engineer
Main Task: Implement end-to-end tests for the popularity tracking feature.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Create end-to-end tests that verify the complete popularity tracking workflow.
5. Test the event processing flow from user interaction to counter update.
6. Test the daily recalculation workflow.
7. Test the UI components that display popularity information.
Goal: Ensure the entire popularity tracking feature works correctly from end to end.
Constraints: Follow testing best practices and ensure comprehensive coverage.
```

## Step 12: Add Monitoring and Logging

```
Role: DevOps Engineer
Main Task: Add monitoring and logging for the popularity tracking feature.
Steps to complete task:
1. Read the specification file at `.amazonq/specs/features/popularity/spec.md` to understand the requirements.
2. Read the documentation folder at `.amazonq/project-intelligence` to understand the project architecture.
3. Read the project rules in `.amazonq/rules` to ensure compliance with coding standards.
4. Configure CloudWatch metrics to track the execution of the Step Functions workflows.
5. Add custom metrics for popularity-related events and calculations.
6. Create a CloudWatch dashboard for monitoring the popularity tracking feature.
7. Set up appropriate alarms for workflow failures or anomalies.
Goal: Ensure the popularity tracking feature can be effectively monitored and troubleshooted.
Constraints: Follow AWS monitoring best practices and ensure comprehensive coverage.
```

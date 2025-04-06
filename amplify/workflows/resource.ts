import { BackendBase } from "@aws-amplify/backend";
import { MessagingResources } from "../messaging/resource";
import {
  Stack,
  aws_stepfunctions as sfn,
  aws_events as events,
  aws_events_targets as targets,
} from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

export type WorkflowResources = {
  stack: Stack;
  promptIncrementCopy: sfn.StateMachine;
  promptIncrementStar: sfn.StateMachine;
  promptDecrementStar: sfn.StateMachine;
};

export function defineWorkflows(
  backend: BackendBase,
  messaging: MessagingResources,
  tables: Record<string, ITable>,
): WorkflowResources {
  const workflowStack = backend.createStack("PromptzWorkflowStack");

  // Create the Step Function state machine for prompt interactions
  const promptIncrementCopyStatemachine = new sfn.StateMachine(
    workflowStack,
    "PromptIncrementCopy",
    {
      queryLanguage: sfn.QueryLanguage.JSONATA,
      definitionBody: sfn.DefinitionBody.fromFile(
        "./amplify/workflows/statemachines/prompt-increment-copy.asl.json",
      ),
      definitionSubstitutions: {
        // Substitute the DynamoDB table name for the Prompt table
        PromptTable: tables["prompt"].tableName,
      },
    },
  );
  const promptIncrementStarStatemachine = new sfn.StateMachine(
    workflowStack,
    "PromptIncrementStar",
    {
      queryLanguage: sfn.QueryLanguage.JSONATA,
      definitionBody: sfn.DefinitionBody.fromFile(
        "./amplify/workflows/statemachines/prompt-increment-star.asl.json",
      ),
      definitionSubstitutions: {
        // Substitute the DynamoDB table name for the Prompt table
        PromptTable: tables["prompt"].tableName,
      },
    },
  );
  const promptDecrementStarStatemachine = new sfn.StateMachine(
    workflowStack,
    "PromptDecrementStar",
    {
      queryLanguage: sfn.QueryLanguage.JSONATA,
      definitionBody: sfn.DefinitionBody.fromFile(
        "./amplify/workflows/statemachines/prompt-decrement-star.asl.json",
      ),
      definitionSubstitutions: {
        // Substitute the DynamoDB table name for the Prompt table
        PromptTable: tables["prompt"].tableName,
      },
    },
  );

  // Grant the state machine permissions to update the DynamoDB table
  tables["prompt"].grantReadWriteData(promptIncrementCopyStatemachine);
  tables["prompt"].grantReadWriteData(promptIncrementStarStatemachine);
  tables["prompt"].grantReadWriteData(promptDecrementStarStatemachine);

  // Create EventBridge rule for PromptCopied events
  new events.Rule(workflowStack, "PromptCopiedRule", {
    eventBus: messaging.eventBus,
    eventPattern: {
      source: ["promptz.dev"],
      detailType: ["PromptCopied"],
    },
    targets: [new targets.SfnStateMachine(promptIncrementCopyStatemachine)],
    description:
      "Triggers the prompt interaction workflow when a prompt is copied",
  });

  // Create EventBridge rule for PromptStarred events
  new events.Rule(workflowStack, "PromptStarredRule", {
    eventBus: messaging.eventBus,
    eventPattern: {
      source: ["promptz.dev"],
      detailType: ["PromptStarred"],
    },
    targets: [new targets.SfnStateMachine(promptIncrementStarStatemachine)],
    description:
      "Triggers the prompt interaction workflow when a prompt is starred",
  });

  // Create EventBridge rule for PromptUnstarred events
  new events.Rule(workflowStack, "PromptUnstarredRule", {
    eventBus: messaging.eventBus,
    eventPattern: {
      source: ["promptz.dev"],
      detailType: ["PromptUnstarred"],
    },
    targets: [new targets.SfnStateMachine(promptDecrementStarStatemachine)],
    description:
      "Triggers the prompt interaction workflow when a prompt is unstarred",
  });

  return {
    stack: workflowStack,
    promptIncrementCopy: promptIncrementCopyStatemachine,
    promptIncrementStar: promptIncrementStarStatemachine,
    promptDecrementStar: promptDecrementStarStatemachine,
  };
}

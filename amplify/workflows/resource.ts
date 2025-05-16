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
};

export function defineWorkflows(
  backend: BackendBase,
  messaging: MessagingResources,
  tables: Record<string, ITable>,
): WorkflowResources {
  const workflowStack = backend.createStack("PromptzWorkflowStack");

  const rulesIncrementCopyStatemachine = new sfn.StateMachine(
    workflowStack,
    "RuleIncrementCopy",
    {
      queryLanguage: sfn.QueryLanguage.JSONATA,
      definitionBody: sfn.DefinitionBody.fromFile(
        "./amplify/workflows/statemachines/rule-increment-copy.asl.json",
      ),
      definitionSubstitutions: {
        // Substitute the DynamoDB table name for the Prompt table
        ProjectRuleTable: tables["projectRule"].tableName,
      },
    },
  );

  const rulesIncrementDownloadStatemachine = new sfn.StateMachine(
    workflowStack,
    "RuleIncrementDownload",
    {
      queryLanguage: sfn.QueryLanguage.JSONATA,
      definitionBody: sfn.DefinitionBody.fromFile(
        "./amplify/workflows/statemachines/rule-increment-download.asl.json",
      ),
      definitionSubstitutions: {
        // Substitute the DynamoDB table name for the Prompt table
        ProjectRuleTable: tables["projectRule"].tableName,
      },
    },
  );

  tables["projectRule"].grantReadWriteData(rulesIncrementCopyStatemachine);
  tables["projectRule"].grantReadWriteData(rulesIncrementDownloadStatemachine);

  new events.Rule(workflowStack, "ProjectRuleCopiedRule", {
    eventBus: messaging.eventBus,
    eventPattern: {
      source: ["promptz.dev"],
      detailType: ["RuleCopied"],
    },
    targets: [new targets.SfnStateMachine(rulesIncrementCopyStatemachine)],
    description:
      "Triggers the project rule interaction workflow when a project rule is copied",
  });

  new events.Rule(workflowStack, "ProjectRuleDownloadedRule", {
    eventBus: messaging.eventBus,
    eventPattern: {
      source: ["promptz.dev"],
      detailType: ["RuleDownloaded"],
    },
    targets: [new targets.SfnStateMachine(rulesIncrementDownloadStatemachine)],
    description:
      "Triggers the project rule interaction workflow when a project rule is downloaded",
  });

  return {
    stack: workflowStack,
  };
}

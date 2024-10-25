/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreatePromptTemplate =
  /* GraphQL */ `subscription OnCreatePromptTemplate(
  $filter: ModelSubscriptionPromptTemplateFilterInput
) {
  onCreatePromptTemplate(filter: $filter) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnCreatePromptTemplateSubscriptionVariables,
    APITypes.OnCreatePromptTemplateSubscription
  >;
export const onDeletePromptTemplate =
  /* GraphQL */ `subscription OnDeletePromptTemplate(
  $filter: ModelSubscriptionPromptTemplateFilterInput
) {
  onDeletePromptTemplate(filter: $filter) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnDeletePromptTemplateSubscriptionVariables,
    APITypes.OnDeletePromptTemplateSubscription
  >;
export const onUpdatePromptTemplate =
  /* GraphQL */ `subscription OnUpdatePromptTemplate(
  $filter: ModelSubscriptionPromptTemplateFilterInput
) {
  onUpdatePromptTemplate(filter: $filter) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
    APITypes.OnUpdatePromptTemplateSubscriptionVariables,
    APITypes.OnUpdatePromptTemplateSubscription
  >;

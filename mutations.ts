/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createPromptTemplate =
  /* GraphQL */ `mutation CreatePromptTemplate(
  $condition: ModelPromptTemplateConditionInput
  $input: CreatePromptTemplateInput!
) {
  createPromptTemplate(condition: $condition, input: $input) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
    APITypes.CreatePromptTemplateMutationVariables,
    APITypes.CreatePromptTemplateMutation
  >;
export const deletePromptTemplate =
  /* GraphQL */ `mutation DeletePromptTemplate(
  $condition: ModelPromptTemplateConditionInput
  $input: DeletePromptTemplateInput!
) {
  deletePromptTemplate(condition: $condition, input: $input) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
    APITypes.DeletePromptTemplateMutationVariables,
    APITypes.DeletePromptTemplateMutation
  >;
export const updatePromptTemplate =
  /* GraphQL */ `mutation UpdatePromptTemplate(
  $condition: ModelPromptTemplateConditionInput
  $input: UpdatePromptTemplateInput!
) {
  updatePromptTemplate(condition: $condition, input: $input) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
    APITypes.UpdatePromptTemplateMutationVariables,
    APITypes.UpdatePromptTemplateMutation
  >;

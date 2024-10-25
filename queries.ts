/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getPromptTemplate =
  /* GraphQL */ `query GetPromptTemplate($id: ID!) {
  getPromptTemplate(id: $id) {
    createdAt
    id
    instruction
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
    APITypes.GetPromptTemplateQueryVariables,
    APITypes.GetPromptTemplateQuery
  >;
export const listPromptTemplates = /* GraphQL */ `query ListPromptTemplates(
  $filter: ModelPromptTemplateFilterInput
  $id: ID
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listPromptTemplates(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      id
      instruction
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPromptTemplatesQueryVariables,
  APITypes.ListPromptTemplatesQuery
>;

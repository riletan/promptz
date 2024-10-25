/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type promptTemplate = {
  __typename: "promptTemplate";
  createdAt: string;
  id: string;
  instruction: string;
  updatedAt: string;
};

export type ModelPromptTemplateFilterInput = {
  and?: Array<ModelPromptTemplateFilterInput | null> | null;
  createdAt?: ModelStringInput | null;
  id?: ModelIDInput | null;
  instruction?: ModelStringInput | null;
  not?: ModelPromptTemplateFilterInput | null;
  or?: Array<ModelPromptTemplateFilterInput | null> | null;
  updatedAt?: ModelStringInput | null;
};

export type ModelStringInput = {
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  beginsWith?: string | null;
  between?: Array<string | null> | null;
  contains?: string | null;
  eq?: string | null;
  ge?: string | null;
  gt?: string | null;
  le?: string | null;
  lt?: string | null;
  ne?: string | null;
  notContains?: string | null;
  size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}

export type ModelSizeInput = {
  between?: Array<number | null> | null;
  eq?: number | null;
  ge?: number | null;
  gt?: number | null;
  le?: number | null;
  lt?: number | null;
  ne?: number | null;
};

export type ModelIDInput = {
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  beginsWith?: string | null;
  between?: Array<string | null> | null;
  contains?: string | null;
  eq?: string | null;
  ge?: string | null;
  gt?: string | null;
  le?: string | null;
  lt?: string | null;
  ne?: string | null;
  notContains?: string | null;
  size?: ModelSizeInput | null;
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export type ModelPromptTemplateConnection = {
  __typename: "ModelPromptTemplateConnection";
  items: Array<promptTemplate | null>;
  nextToken?: string | null;
};

export type ModelPromptTemplateConditionInput = {
  and?: Array<ModelPromptTemplateConditionInput | null> | null;
  createdAt?: ModelStringInput | null;
  instruction?: ModelStringInput | null;
  not?: ModelPromptTemplateConditionInput | null;
  or?: Array<ModelPromptTemplateConditionInput | null> | null;
  updatedAt?: ModelStringInput | null;
};

export type CreatePromptTemplateInput = {
  id?: string | null;
  instruction: string;
};

export type DeletePromptTemplateInput = {
  id: string;
};

export type UpdatePromptTemplateInput = {
  id: string;
  instruction?: string | null;
};

export type ModelSubscriptionPromptTemplateFilterInput = {
  and?: Array<ModelSubscriptionPromptTemplateFilterInput | null> | null;
  createdAt?: ModelSubscriptionStringInput | null;
  id?: ModelSubscriptionIDInput | null;
  instruction?: ModelSubscriptionStringInput | null;
  or?: Array<ModelSubscriptionPromptTemplateFilterInput | null> | null;
  updatedAt?: ModelSubscriptionStringInput | null;
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null;
  between?: Array<string | null> | null;
  contains?: string | null;
  eq?: string | null;
  ge?: string | null;
  gt?: string | null;
  in?: Array<string | null> | null;
  le?: string | null;
  lt?: string | null;
  ne?: string | null;
  notContains?: string | null;
  notIn?: Array<string | null> | null;
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null;
  between?: Array<string | null> | null;
  contains?: string | null;
  eq?: string | null;
  ge?: string | null;
  gt?: string | null;
  in?: Array<string | null> | null;
  le?: string | null;
  lt?: string | null;
  ne?: string | null;
  notContains?: string | null;
  notIn?: Array<string | null> | null;
};

export type GetPromptTemplateQueryVariables = {
  id: string;
};

export type GetPromptTemplateQuery = {
  getPromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type ListPromptTemplatesQueryVariables = {
  filter?: ModelPromptTemplateFilterInput | null;
  id?: string | null;
  limit?: number | null;
  nextToken?: string | null;
  sortDirection?: ModelSortDirection | null;
};

export type ListPromptTemplatesQuery = {
  listPromptTemplates?: {
    __typename: "ModelPromptTemplateConnection";
    items: Array<{
      __typename: "promptTemplate";
      createdAt: string;
      id: string;
      instruction: string;
      updatedAt: string;
    } | null>;
    nextToken?: string | null;
  } | null;
};

export type CreatePromptTemplateMutationVariables = {
  condition?: ModelPromptTemplateConditionInput | null;
  input: CreatePromptTemplateInput;
};

export type CreatePromptTemplateMutation = {
  createPromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type DeletePromptTemplateMutationVariables = {
  condition?: ModelPromptTemplateConditionInput | null;
  input: DeletePromptTemplateInput;
};

export type DeletePromptTemplateMutation = {
  deletePromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type UpdatePromptTemplateMutationVariables = {
  condition?: ModelPromptTemplateConditionInput | null;
  input: UpdatePromptTemplateInput;
};

export type UpdatePromptTemplateMutation = {
  updatePromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type OnCreatePromptTemplateSubscriptionVariables = {
  filter?: ModelSubscriptionPromptTemplateFilterInput | null;
};

export type OnCreatePromptTemplateSubscription = {
  onCreatePromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type OnDeletePromptTemplateSubscriptionVariables = {
  filter?: ModelSubscriptionPromptTemplateFilterInput | null;
};

export type OnDeletePromptTemplateSubscription = {
  onDeletePromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

export type OnUpdatePromptTemplateSubscriptionVariables = {
  filter?: ModelSubscriptionPromptTemplateFilterInput | null;
};

export type OnUpdatePromptTemplateSubscription = {
  onUpdatePromptTemplate?: {
    __typename: "promptTemplate";
    createdAt: string;
    id: string;
    instruction: string;
    updatedAt: string;
  } | null;
};

import { PromptViewModel } from "@/models/PromptViewModel";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { UserViewModel } from "@/models/UserViewModel";
import { PromptViewModelCollection } from "@/models/PromptViewModelCollection";

export type FacetType = "OWNER" | "CATEGORY" | "SDLC_PHASE" | "SEARCH";

export type Facets = {
  facet: FacetType;
  value: string;
};

export interface PromptRepository {
  getPrompt(id: string): Promise<PromptViewModel>;
  listPrompts(
    limit?: number,
    facets?: Array<Facets>,
  ): Promise<PromptViewModelCollection>;
  createPrompt(
    prompt: PromptViewModel,
    owner: UserViewModel,
  ): Promise<PromptViewModel>;
  updatePrompt(prompt: PromptViewModel): Promise<PromptViewModel>;
}

export class PromptGraphQLRepository implements PromptRepository {
  client;
  constructor() {
    this.client = generateClient<Schema>();
  }

  async updatePrompt(prompt: PromptViewModel): Promise<PromptViewModel> {
    const { data: createdPrompt, errors } =
      await this.client.models.prompt.update(
        {
          id: prompt.id,
          name: prompt.name,
          description: prompt.description,
          sdlc_phase: prompt.sdlcPhase,
          category: prompt.category,
          instruction: prompt.instruction,
        },
        {
          authMode: "userPool",
        },
      );
    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }
    return PromptViewModel.fromSchema(createdPrompt!);
  }

  async createPrompt(
    prompt: PromptViewModel,
    owner: UserViewModel,
  ): Promise<PromptViewModel> {
    const { data: createdPrompt, errors } =
      await this.client.models.prompt.create(
        {
          name: prompt.name,
          description: prompt.description,
          sdlc_phase: prompt.sdlcPhase,
          category: prompt.category,
          instruction: prompt.instruction,
          owner_username: owner.userName,
        },
        {
          authMode: "userPool",
        },
      );
    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }
    return PromptViewModel.fromSchema(createdPrompt!);
  }

  async getPrompt(id: string) {
    const { data: prompt, errors } = await this.client.models.prompt.get({
      id: id,
    });

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }
    if (prompt) {
      return PromptViewModel.fromSchema(prompt);
    } else {
      throw new Error("Prompt not found");
    }
  }

  async listPrompts(
    limit?: number,
    facets?: Array<Facets>,
    pageToken?: string | null | undefined,
  ): Promise<PromptViewModelCollection> {
    const {
      data: prompts,
      errors,
      nextToken,
    } = await this.client.models.prompt.list({
      limit: limit ?? 0,
      nextToken: pageToken,
      filter: {
        and: this.facetsToFilter(facets),
      },
    });

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }
    return this.parseResponse(prompts, nextToken || "");
  }

  private parseResponse(
    prompts: Array<Schema["prompt"]["type"]>,
    nextToken?: string,
  ) {
    if (prompts) {
      const promptViewModelList = prompts.map((p) =>
        PromptViewModel.fromSchema(p),
      );
      const promptList = nextToken
        ? new PromptViewModelCollection(promptViewModelList, nextToken)
        : new PromptViewModelCollection(promptViewModelList);

      return promptList;
    } else {
      throw new Error("No prompts found");
    }
  }

  private facetsToFilter(facets?: Array<Facets>) {
    return facets
      ? facets.map((f) => {
          if (f.facet === "SEARCH") {
            return {
              ["name"]: { contains: f.value },
            };
          } else {
            return {
              [f.facet.toLowerCase()]: {
                // see https://github.com/aws-amplify/amplify-category-api/issues/665#issuecomment-1189619200
                eq: f.facet === "OWNER" ? `${f.value}::${f.value}` : f.value,
              },
            };
          }
        })
      : [];
  }
}

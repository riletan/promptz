"use server";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";

import { type Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Prompt, searchParamsSchema } from "@/app/lib/definitions";
import { fetchCurrentAuthUser } from "@/app/lib/actions/cognito-server";
import {
  FilterCondition,
  buildTextSearchFilter,
  buildTagFilter,
} from "@/app/lib/filters";
import { z } from "zod";

interface FetchPromptsResult {
  prompts: Prompt[];
  nextToken?: string | null;
}

type SearchSchema = z.output<typeof searchParamsSchema>;

const appsync = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export async function fetchFeaturedPrompts(): Promise<Prompt[]> {
  const { data: prompts, errors } = await appsync.models.prompt.list({
    limit: 3,
    filter: {
      public: { eq: true },
    },
  });

  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return mapToPrompts(prompts);
}

export async function fetchPrompt(id: string) {
  const { data: prompt, errors } = await appsync.models.prompt.get({
    id,
  });

  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  if (!prompt) {
    throw new Error("Prompt not found");
  }

  return mapToPrompt(prompt);
}

export async function searchPrompts(
  params: SearchSchema,
): Promise<FetchPromptsResult> {
  try {
    // Validate search params
    const validatedParams = searchParamsSchema.parse(params);

    const filter: FilterCondition = {};
    const facets: FilterCondition[] = [];

    // Handle user-specific filter
    if (validatedParams.my) {
      const user = await fetchCurrentAuthUser();
      facets.push({ owner: { eq: `${user.id}::${user.username}` } });
    } else {
      filter.public = { eq: true };
    }

    // Build query filter
    if (validatedParams.query) {
      filter.or = buildTextSearchFilter(validatedParams.query).or;
    }

    // Handle all tag-based filters
    if (params.interface) {
      // Convert to array if it's a string
      const interfaceParams = Array.isArray(params.interface)
        ? params.interface
        : [params.interface];
      facets.push(...buildTagFilter(interfaceParams));
    }
    if (params.category) {
      const categoryParams = Array.isArray(params.category)
        ? params.category
        : [params.category];
      facets.push(...buildTagFilter(categoryParams));
    }

    if (params.sdlc) {
      const sdlcParams = Array.isArray(params.sdlc)
        ? params.sdlc
        : [params.sdlc];
      facets.push(...buildTagFilter(sdlcParams));
    }

    // Add facets to filter
    if (facets.length > 0) {
      filter.and = facets;
    }

    console.log(filter);
    const {
      data: prompts,
      errors,
      nextToken,
    } = await appsync.models.prompt.list({
      filter,
      limit: 1000,
    });

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    // Map the prompts to our frontend model
    let promptList = mapToPrompts(prompts);

    const sortParam = validatedParams.sort || "created_at:desc";
    const [sortField, sortDirection] = sortParam.split(":");

    if (sortField === "created_at") {
      promptList = promptList.sort((a, b) => {
        const aDate = new Date(a.createdAt || "").getTime();
        const bDate = new Date(b.createdAt || "").getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      });
    }

    return {
      prompts: promptList,
      nextToken,
    };
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
}

function mapToPrompt(prompt: Schema["prompt"]["type"]): Prompt {
  const tags: string[] = prompt.tags
    ? prompt.tags.filter((tag): tag is NonNullable<typeof tag> => tag != null)
    : [];

  return {
    id: prompt.id,
    title: prompt.name,
    description: prompt.description,
    tags: tags,
    author: prompt.owner_username,
    authorId: prompt.owner || "",
    instruction: prompt.instruction,
    howto: prompt.howto || "",
    public: prompt.public || false,
    sourceURL: prompt.sourceURL || "",
    createdAt: prompt.createdAt || "",
    updatedAt: prompt.updatedAt || "",
  };
}

function mapToPrompts(prompts: Schema["prompt"]["type"][]): Prompt[] {
  return prompts.map(mapToPrompt);
}

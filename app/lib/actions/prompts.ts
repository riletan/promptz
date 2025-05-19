"use server";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";

import { type Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Prompt, promptSearchParamsSchema } from "../prompt-model";
import { z } from "zod";
import { GraphQLResult } from "aws-amplify/api";

interface FetchPromptsResult {
  prompts: Prompt[];
  nextToken?: string | null;
}

interface PromptBySlugResponse {
  listBySlug: {
    items: {
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      tags?: string[];
      instruction?: string;
      sourceURL?: string;
      howto?: string;
      public?: string;
      author: {
        id?: string;
        displayName?: string;
      };
      createdAt?: string;
      updatedAt?: string;
    }[];
    nextToken?: string;
  };
}

type SearchSchema = z.output<typeof promptSearchParamsSchema>;

const appsync = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export async function fetchPromptSlug(id: string) {
  const { data, errors } = await appsync.models.prompt.get(
    {
      id,
    },
    {
      selectionSet: ["slug"],
    },
  );

  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  if (!data) {
    return;
  }

  return data.slug;
}

export async function fetchPromptBySlug(slug: string) {
  const GET_PROMPT_BY_SLUG = `
  query ListPrompts($slug: String!) {
    listBySlug(slug: $slug) {
      items {
        id
        name
        slug
        description
        tags
        instruction
        sourceURL
        howto
        public
        author {
          id
          displayName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

  // we have to use the raw graphql client as the type generation for
  // queries with secondary indexes is buggy and results in an error of invalid
  // type matching of filters.
  const response = (await appsync.graphql<PromptBySlugResponse>({
    query: GET_PROMPT_BY_SLUG,
    variables: { slug: slug },
  })) as GraphQLResult<PromptBySlugResponse>;

  // Check if data exists
  if (!response.data) {
    throw new Error("No data returned from query");
  }

  const prompt = response.data.listBySlug.items[0];

  if (!prompt) {
    return;
  }

  return {
    id: prompt.id,
    title: prompt.name,
    slug: prompt.slug,
    description: prompt.description,
    tags: prompt.tags,
    instruction: prompt.instruction,
    sourceURL: prompt.sourceURL,
    howto: prompt.howto,
    public: prompt.public,
    author: prompt.author.displayName,
    authorId: prompt.author.id,
  } as Prompt;
}

export async function searchPrompts(
  params: SearchSchema,
): Promise<FetchPromptsResult> {
  try {
    // Validate search params
    const validatedParams = promptSearchParamsSchema.parse(params);

    // Normalize tags to always be an array or undefined
    const normalizedTags = validatedParams.tags
      ? Array.isArray(validatedParams.tags)
        ? validatedParams.tags
        : [validatedParams.tags]
      : undefined;

    const { data: searchResults, errors } = await appsync.queries.searchPrompts(
      {
        query: validatedParams.query,
        tags: normalizedTags,
      },
    );

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (!searchResults?.prompts) {
      return {
        prompts: [],
        nextToken: undefined,
      };
    }

    // Map the prompts to our frontend model
    let promptList = searchResults?.prompts
      ?.filter((p) => p != null)
      .map((p) => {
        return {
          id: p.id || "",
          title: p.name || "",
          description: p.description || "",
          tags: p.tags,
          createdAt: p.createdAt || "",
          updatedAt: p.updatedAt || "",
        } as Prompt;
      });

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
      nextToken: searchResults.nextToken,
    };
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
}

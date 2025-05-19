"use server";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";

import { type Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { projectRuleSearchParamsSchema } from "../project-rule-model";
import { ProjectRule } from "../project-rule-model";
import { z } from "zod";
import { GraphQLResult } from "aws-amplify/api";
import { normalizeTags } from "@/app/lib/filters";

interface FetchProjectRulesResult {
  projectRules: ProjectRule[];
  nextToken?: string | null;
}

type SearchSchema = z.output<typeof projectRuleSearchParamsSchema>;

const appsync = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

/**
 * Interface for the GraphQL response when fetching a project rule by slug
 */
interface ProjectRuleBySlugResponse {
  listRuleBySlug: {
    items: {
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      tags?: string[];
      content?: string;
      sourceURL?: string;
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

/**
 * Fetches a project rule by its slug
 * @param slug The slug of the project rule to fetch
 * @returns The project rule or undefined if not found
 */
export async function fetchProjectRuleBySlug(slug: string) {
  const GET_PROJECT_RULE_BY_SLUG = `
  query ListProjectRules($slug: String!) {
    listRuleBySlug(slug: $slug) {
      items {
        id
        name
        slug
        description
        tags
        content
        sourceURL
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

  // Using raw GraphQL client as the type generation for queries with secondary indexes can be buggy
  const response = (await appsync.graphql<ProjectRuleBySlugResponse>({
    query: GET_PROJECT_RULE_BY_SLUG,
    variables: { slug: slug },
  })) as GraphQLResult<ProjectRuleBySlugResponse>;

  // Check if data exists
  if (!response.data) {
    throw new Error("No data returned from query");
  }

  const projectRule = response.data.listRuleBySlug.items[0];

  if (!projectRule) {
    return;
  }

  return {
    id: projectRule.id,
    title: projectRule.name,
    slug: projectRule.slug,
    description: projectRule.description,
    tags: projectRule.tags,
    content: projectRule.content,
    sourceURL: projectRule.sourceURL,
    public: projectRule.public,
    author: projectRule.author?.displayName || "",
    authorId: projectRule.author?.id || "",
  } as ProjectRule;
}

/**
 * Searches for project rules based on provided parameters
 * @param params Search parameters for filtering project rules
 * @returns Object containing project rules and next token for pagination
 */
export async function searchProjectRules(
  params: SearchSchema,
): Promise<FetchProjectRulesResult> {
  try {
    // Validate search params
    const validatedParams = projectRuleSearchParamsSchema.parse(params);

    const normalizedTags = normalizeTags(validatedParams.tags || []);

    const { data: searchResults, errors } =
      await appsync.queries.searchProjectRules({
        query: validatedParams.query,
        tags: normalizedTags,
      });

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (!searchResults?.results) {
      return {
        projectRules: [],
        nextToken: undefined,
      };
    }

    // Map the project rules to our frontend model
    let projectRulesList = searchResults?.results
      ?.filter((p) => p != null)
      .map((p) => {
        return {
          id: p.id || "",
          title: p.name || "",
          description: p.description || "",
          tags: p.tags,
          slug: p.slug || "",
          createdAt: p.createdAt || "",
          updatedAt: p.updatedAt || "",
        } as ProjectRule;
      });

    const sortParam = validatedParams.sort || "created_at:desc";
    const [sortField, sortDirection] = sortParam.split(":");

    if (sortField === "created_at") {
      projectRulesList = projectRulesList.sort((a, b) => {
        const aDate = new Date(a.createdAt || "").getTime();
        const bDate = new Date(b.createdAt || "").getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      });
    }

    return {
      projectRules: projectRulesList,
      nextToken: searchResults.nextToken,
    };
  } catch (error) {
    console.error("Error fetching project rules:", error);
    throw error;
  }
}

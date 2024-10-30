import { useState, useEffect } from "react";
import {
  Facets,
  PromptGraphQLRepository,
} from "@/repositories/PromptRepository";
import { PromptViewModel } from "@/models/PromptViewModel";

const repository = new PromptGraphQLRepository();

export function usePromptCollection(limit?: number, filter?: Array<Facets>) {
  const [prompts, setPrompts] = useState<Array<PromptViewModel>>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [facets, setFacets] = useState<Array<Facets>>(filter || []);

  useEffect(() => {
    loadPrompts();
  }, [facets]);

  const loadPrompts = async () => {
    try {
      const promptList = await repository.listPrompts(limit, facets, nextToken);
      setLoading(false);
      setPrompts([...prompts, ...promptList.prompts]);
      if (promptList.nextToken) {
        setNextToken(promptList.nextToken);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    await loadPrompts();
  };

  const addFilter = async (filter: Facets) => {
    const i = facets.findIndex((f) => f.facet === filter.facet);
    if (i > -1) {
      facets[i] = filter;
    } else {
      facets.push(filter);
    }
    setFacets([...facets]);
    setNextToken(undefined);
    setPrompts([]);
  };

  const resetFilter = async () => {
    setFacets([]);
  };

  return {
    prompts,
    error,
    loading,
    hasMore,
    handleLoadMore,
    addFilter,
    resetFilter,
  };
}

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { PromptViewModel } from "@/models/PromptViewModel";

const repository = new PromptGraphQLRepository();

export function usePromptCollection(limit?: number) {
  const [prompts, setPrompts] = useState<Array<PromptViewModel>>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const prompts = await repository.listPrompts(limit);
      setPrompts(prompts);
      setLoading(false);
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  };

  return { prompts, error, loading };
}

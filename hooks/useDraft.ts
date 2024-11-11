import { useState, useEffect } from "react";
import { PromptViewModel } from "../models/PromptViewModel";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { LocalStorageDraftRepository } from "@/repositories/DraftRepository";

const repository = new PromptGraphQLRepository();
const draftRepository = new LocalStorageDraftRepository();
export function useDraft(promptId: string) {
  const [promptViewModel, setPromptViewModel] =
    useState<PromptViewModel | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        let prompt = draftRepository.getDraft(promptId);
        if (!prompt) {
          prompt = await repository.getPrompt(promptId);
        }
        setPromptViewModel(prompt);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };

    loadPrompt();
  }, [promptId]);

  return { promptViewModel, error, loading };
}

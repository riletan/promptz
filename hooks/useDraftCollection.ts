import { useState, useEffect } from "react";
import { PromptViewModel } from "@/models/PromptViewModel";
import { LocalStorageDraftRepository } from "@/repositories/DraftRepository";

const repository = new LocalStorageDraftRepository();

export function useDraftCollection() {
  const [drafts, setDrafts] = useState<Array<PromptViewModel>>([]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const drafts = await repository.getAllDrafts();
    setDrafts(Object.values(drafts));
  };

  return {
    drafts,
  };
}

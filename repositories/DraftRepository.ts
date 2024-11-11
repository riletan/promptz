import { PromptViewModel } from "@/models/PromptViewModel";

export interface DraftRepository {
  saveDraft(draft: PromptViewModel): void;
  getDraft(promptId: string): PromptViewModel | null;
  deleteDraft(promptId: string): void;
  getAllDrafts(): { [key: string]: PromptViewModel };
  hasDraft(promptId: string): boolean;
}

export class LocalStorageDraftRepository {
  private static readonly STORAGE_KEY = "promptz_drafts";

  public saveDraft(draft: PromptViewModel): void {
    const drafts = this.getAllDrafts();
    const key = draft.id;
    drafts[key] = draft;
    localStorage.setItem(
      LocalStorageDraftRepository.STORAGE_KEY,
      JSON.stringify(drafts),
    );
  }

  public getDraft(promptId: string): PromptViewModel | null {
    const drafts = this.getAllDrafts();
    const draft = drafts[promptId];
    if (!draft) return null;

    const draftVM = new PromptViewModel();
    Object.assign(draftVM, draft);
    return draftVM;
  }

  public deleteDraft(promptId: string): void {
    console.log(`delete draft ${promptId}`);
    const drafts = this.getAllDrafts();
    delete drafts[promptId];
    localStorage.setItem(
      LocalStorageDraftRepository.STORAGE_KEY,
      JSON.stringify(drafts),
    );
  }

  public getAllDrafts(): { [key: string]: PromptViewModel } {
    try {
      const draftsJson = localStorage.getItem(
        LocalStorageDraftRepository.STORAGE_KEY,
      );
      if (!draftsJson) return {};

      const drafts = JSON.parse(draftsJson);
      // Convert plain objects back to DraftViewModel instances
      return Object.entries(drafts).reduce(
        (acc, [key, draft]) => {
          const draftVM = new PromptViewModel();
          Object.assign(draftVM, draft);
          acc[key] = draftVM;
          return acc;
        },
        {} as { [key: string]: PromptViewModel },
      );
    } catch (error) {
      console.error("Error reading drafts from localStorage:", error);
      return {};
    }
  }

  public hasDraft(promptId: string): boolean {
    return !!this.getDraft(promptId);
  }
}

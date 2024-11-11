import { PromptViewModel } from "@/models/PromptViewModel";

export class DraftRepository {
  private static readonly STORAGE_KEY = "promptz_drafts";

  public static saveDraft(draft: PromptViewModel): void {
    const drafts = this.getAllDrafts();
    const key = draft.id;
    drafts[key] = draft;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
  }

  public static getDraft(promptId: string): PromptViewModel | null {
    const drafts = this.getAllDrafts();
    const draft = drafts[promptId];
    if (!draft) return null;

    const draftVM = new PromptViewModel();
    Object.assign(draftVM, draft);
    return draftVM;
  }

  public static deleteDraft(promptId: string): void {
    const drafts = this.getAllDrafts();
    delete drafts[promptId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
  }

  public static getAllDrafts(): { [key: string]: PromptViewModel } {
    try {
      const draftsJson = localStorage.getItem(this.STORAGE_KEY);
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

  public static hasDraft(promptId: string): boolean {
    return !!this.getDraft(promptId);
  }
}

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { PromptViewModel } from "@/models/PromptViewModel";
import { LocalStorageDraftRepository } from "@/repositories/DraftRepository";
import { useDraftCollection } from "@/hooks/useDraftCollection";

vi.mock("@/repositories/DraftRepository");

describe("usePromptCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch drafts and update state", async () => {
    const mockPrompt = new PromptViewModel();
    const mockDrafts = { 1: mockPrompt };
    vi.mocked(
      LocalStorageDraftRepository.prototype.getAllDrafts,
    ).mockReturnValue(mockDrafts);

    const { result } = renderHook(() => useDraftCollection());

    await waitFor(() => {
      expect(result.current.drafts).toEqual([mockPrompt]);
    });
  });
});

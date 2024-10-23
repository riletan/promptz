import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePromptCollection } from "@/hooks/usePromptCollection";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { PromptCategory, PromptViewModel, SdlcPhase } from "@/models/PromptViewModel";

vi.mock("@/repositories/PromptRepository");

describe("usePromptCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch prompts and update state", async () => {
    const mockPrompts = [
      new PromptViewModel(
        "1",
        "Test Prompt 1",
        "Content 1",
        SdlcPhase.DEPLOY,
        PromptCategory.CHAT,
        "instruction",
        "user1",
        "owner1"
      ),
      new PromptViewModel(
        "2",
        "Test Prompt 2",
        "Content 2",
        SdlcPhase.DEPLOY,
        PromptCategory.CHAT,
        "instruction",
        "user2",
        "owner2"
      ),
    ];
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(mockPrompts);

    const { result } = renderHook(() => usePromptCollection());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.prompts).toEqual(mockPrompts);
      expect(result.current.error).toBe(null);
    });
  });

  it("should handle errors when fetching prompts", async () => {
    const mockError = new Error("Failed to fetch prompts");
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePromptCollection());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.prompts).toEqual([]);
      expect(result.current.error).toBe(mockError);
    });
  });

  it("should respect the limit parameter", async () => {
    const limit = 5;
    const mockPrompts = Array(limit)
      .fill(null)
      .map(
        (_, index) =>
          new PromptViewModel(
            String(index + 1),
            `Test Prompt ${index + 1}`,
            `Content ${index + 1}`,
            SdlcPhase.DEPLOY,
            PromptCategory.CHAT,
            "instruction",
            `user${index + 1}`,
            `owner${index + 1}`
          )
      );
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(mockPrompts);

    const { result } = renderHook(() => usePromptCollection(limit));

    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(limit);
      expect(PromptGraphQLRepository.prototype.listPrompts).toHaveBeenCalledWith(limit);
    });
  });

  it("should not make unnecessary API calls on re-render", async () => {
    const mockPrompts = [
      new PromptViewModel(
        "1",
        "Test Prompt 1",
        "Content 1",
        SdlcPhase.DEPLOY,
        PromptCategory.CHAT,
        "instruction",
        "user1",
        "owner1"
      ),
      new PromptViewModel(
        "2",
        "Test Prompt 2",
        "Content 2",
        SdlcPhase.DEPLOY,
        PromptCategory.CHAT,
        "instruction",
        "user2",
        "owner2"
      ),
    ];
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(mockPrompts);

    const { result, rerender } = renderHook(() => usePromptCollection());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(PromptGraphQLRepository.prototype.listPrompts).toHaveBeenCalledTimes(1);

    rerender();

    expect(PromptGraphQLRepository.prototype.listPrompts).toHaveBeenCalledTimes(1);
  });
});

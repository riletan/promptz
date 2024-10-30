import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePromptCollection } from "@/hooks/usePromptCollection";
import {
  Facets,
  PromptGraphQLRepository,
} from "@/repositories/PromptRepository";
import { PromptViewModel } from "@/models/PromptViewModel";
import { PromptViewModelCollection } from "@/models/PromptViewModelCollection";

vi.mock("@/repositories/PromptRepository");

describe("usePromptCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch prompts and update state", async () => {
    const mockPrompts = [new PromptViewModel(), new PromptViewModel()];
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(
      new PromptViewModelCollection(mockPrompts),
    );

    const { result } = renderHook(() => usePromptCollection());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.prompts).toEqual(mockPrompts);
      expect(result.current.error).toBe(null);
    });
  });

  it("should handle errors when fetching prompts", async () => {
    const mockError = new Error("Failed to fetch prompts");
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockRejectedValue(
      mockError,
    );

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
      .map(() => new PromptViewModel());
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(
      new PromptViewModelCollection(mockPrompts),
    );

    const { result } = renderHook(() => usePromptCollection(limit));

    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(limit);
      expect(
        PromptGraphQLRepository.prototype.listPrompts,
      ).toHaveBeenCalledWith(limit, [], undefined);
    });
  });

  it("should not make unnecessary API calls on re-render", async () => {
    const mockPrompts = [new PromptViewModel(), new PromptViewModel()];
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(
      new PromptViewModelCollection(mockPrompts),
    );

    const { result, rerender } = renderHook(() => usePromptCollection());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(PromptGraphQLRepository.prototype.listPrompts).toHaveBeenCalledTimes(
      1,
    );

    rerender();

    expect(PromptGraphQLRepository.prototype.listPrompts).toHaveBeenCalledTimes(
      1,
    );
  });

  it("should call repository with facets parameter", async () => {
    const limit = 5;
    const facets: Array<Facets> = [{ facet: "OWNER", value: "1" }];
    const mockPrompts = Array(limit)
      .fill(null)
      .map(() => new PromptViewModel());
    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockResolvedValue(
      new PromptViewModelCollection(mockPrompts),
    );

    const { result } = renderHook(() => usePromptCollection(limit, facets));

    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(limit);
      expect(
        PromptGraphQLRepository.prototype.listPrompts,
      ).toHaveBeenCalledWith(limit, facets, undefined);
    });
  });

  it("should update prompts when facets change", async () => {
    const limit = 5;
    const initialFacets: Array<Facets> = [{ facet: "OWNER", value: "1" }];
    const newFacet: Facets = { facet: "OWNER", value: "2" };

    const mockPrompts1 = Array(limit)
      .fill(null)
      .map(() => new PromptViewModel());
    const mockPrompts2 = Array(limit)
      .fill(null)
      .map(() => new PromptViewModel());

    vi.mocked(PromptGraphQLRepository.prototype.listPrompts)
      .mockResolvedValueOnce(new PromptViewModelCollection(mockPrompts1))
      .mockResolvedValueOnce(new PromptViewModelCollection(mockPrompts2));

    const { result, rerender } = renderHook(
      ({ limit, facets }) => usePromptCollection(limit, facets),
      {
        initialProps: { limit, facets: initialFacets },
      },
    );

    await waitFor(() => {
      expect(result.current.prompts).toEqual(mockPrompts1);
      expect(
        PromptGraphQLRepository.prototype.listPrompts,
      ).toHaveBeenCalledWith(limit, initialFacets, undefined);
    });
    result.current.addFilter(newFacet);
    rerender({ limit, facets: initialFacets });

    await waitFor(() => {
      expect(result.current.prompts).toEqual(mockPrompts2);
      expect(
        PromptGraphQLRepository.prototype.listPrompts,
      ).toHaveBeenCalledWith(limit, [newFacet], undefined);
    });
  });

  it("should handle loading state correctly when fetching new prompts", async () => {
    const limit = 5;
    const mockPrompts = Array(limit)
      .fill(null)
      .map(() => new PromptViewModel());

    let resolvePromise: (value: PromptViewModelCollection) => void;
    const promise = new Promise<PromptViewModelCollection>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(PromptGraphQLRepository.prototype.listPrompts).mockReturnValue(
      promise,
    );

    const { result } = renderHook(() => usePromptCollection(limit));

    expect(result.current.loading).toBe(true);
    expect(result.current.prompts).toEqual([]);

    resolvePromise!(new PromptViewModelCollection(mockPrompts));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.prompts).toEqual(mockPrompts);
    });
  });
});

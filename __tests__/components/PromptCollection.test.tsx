import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PromptCollection from "@/components/PromptCollection";
import { usePromptCollection } from "@/hooks/usePromptCollection";
import { useAuth } from "@/contexts/AuthContext";
import "@testing-library/jest-dom/vitest";
import { PromptViewModel } from "@/models/PromptViewModel";

// Mock the hooks
vi.mock("@/hooks/usePromptCollection");
vi.mock("@/contexts/AuthContext");

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("PromptCollection component", () => {
  it("renders loading state", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: null,
      loading: true,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    render(<PromptCollection showLoadMore={false} />);
    expect(screen.getByText("Loading a world of prompts")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const testError = new Error("Test error");
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: testError,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    render(<PromptCollection showLoadMore={false} />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders empty state for non-guest user", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });

    render(<PromptCollection showLoadMore={false} />);
    expect(screen.getByText("No prompts created yet")).toBeInTheDocument();
    expect(
      screen.getByText("Be the first. Create a prompt."),
    ).toBeInTheDocument();
  });

  it("renders empty state for guest user", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });

    render(<PromptCollection showLoadMore={false} />);
    expect(screen.getByText("No prompts created yet")).toBeInTheDocument();
    expect(
      screen.getByText("Be the first. Create a prompt."),
    ).toBeInTheDocument();
  });

  it("renders load more button when hasMore is true", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: true,
      handleLoadMore: vi.fn(),
    });

    render(<PromptCollection showLoadMore={true} />);
    expect(screen.getByText("Load more")).toBeInTheDocument();
    expect(screen.getByText("Load more")).not.toBeDisabled();
  });

  it("disables load more button when hasMore is false", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });

    render(<PromptCollection showLoadMore={true} />);
    expect(screen.getByText("Load more")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not render load more button when showLoadMore is false", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
    });

    render(<PromptCollection showLoadMore={false} />);
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });
});

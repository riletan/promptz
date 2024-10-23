import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePrompt } from "@/hooks/usePrompt";
import Prompt from "@/components/Prompt";
import { useUser } from "@/hooks/useUser";
import "@testing-library/jest-dom/vitest";
import { SdlcPhase, PromptCategory, PromptViewModel } from "@/models/PromptViewModel";
import { UserViewModel } from "@/models/UserViewModel";

// Mock the hooks
vi.mock("@/hooks/usePrompt");
vi.mock("@/hooks/useUser");

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const promptViewModel = PromptViewModel.fromSchema({
  id: "test-id",
  name: "Test Prompt",
  instruction: "Test instruction",
  sdlc_phase: SdlcPhase.DEPLOY,
  category: PromptCategory.CHAT,
  owner_username: "Test User",
  owner: "user123",
  description: "description",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("Prompt component", () => {
  it("renders loading state", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: true, error: null, promptViewModel: null });
    vi.mocked(useUser).mockReturnValue({ userViewModel: null, error: null, loading: false });

    render(<Prompt promptId="test-id" />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: false, error: new Error("Test error"), promptViewModel: null });
    vi.mocked(useUser).mockReturnValue({ userViewModel: null, error: null, loading: false });
    render(<Prompt promptId="test-id" />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.getByTestId("error")).toHaveTextContent("Test error");
  });

  it("renders prompt data", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: false, error: null, promptViewModel: promptViewModel });
    vi.mocked(useUser).mockReturnValue({ userViewModel: null, error: null, loading: false });

    render(<Prompt promptId="test-id" />);
    expect(screen.getByText(promptViewModel.name)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.instruction)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.sdlcPhase)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.category)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.createdBy())).toBeInTheDocument();
  });

  it("renders edit button for owner", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: false, error: null, promptViewModel: promptViewModel });
    vi.mocked(useUser).mockReturnValue({
      userViewModel: new UserViewModel("user123", "test"),
      error: null,
      loading: false,
    });

    render(<Prompt promptId="test-id" />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("does not render edit button for non-owner", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: false, error: null, promptViewModel: promptViewModel });
    vi.mocked(useUser).mockReturnValue({
      userViewModel: new UserViewModel("user1456", "test"),
      error: null,
      loading: false,
    });

    render(<Prompt promptId="test-id" />);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("renders copy button", () => {
    vi.mocked(usePrompt).mockReturnValue({ loading: false, error: null, promptViewModel: promptViewModel });
    vi.mocked(useUser).mockReturnValue({
      userViewModel: new UserViewModel("user123", "test"),
      error: null,
      loading: false,
    });

    render(<Prompt promptId="test-id" />);
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });
});

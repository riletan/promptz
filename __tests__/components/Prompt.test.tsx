import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePrompt } from "@/hooks/usePrompt";
import Prompt from "@/components/Prompt";
import { useAuth } from "@/contexts/AuthContext";
import "@testing-library/jest-dom/vitest";
import createWrapper from "@cloudscape-design/components/test-utils/dom";

import { PromptViewModel } from "@/models/PromptViewModel";
import { UserViewModel } from "@/models/UserViewModel";

// Mock the hooks
vi.mock("@/hooks/usePrompt");
vi.mock("@/contexts/AuthContext");

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
  sdlc_phase: "DEPLOY",
  category: "CHAT",
  owner_username: "Test User",
  owner: "user123",
  description: "description",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("Prompt component", () => {
  it("renders loading state", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: true,
      error: null,
      promptViewModel: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("guest", "guest"),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container);
    expect(
      wrapper.findContainer('[data-testid="container-loading"]'),
    ).toBeTruthy();
  });

  it("renders error state", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: new Error("Test error"),
      promptViewModel: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("guest", "guest"),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });
    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container).findAlert(
      '[data-testid="alert-error"]',
    )!;
    expect(wrapper.findContent().getElement().textContent).toContain(
      "Test error",
    );
  });

  it("renders prompt data", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: null,
      promptViewModel: promptViewModel,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("guest", "guest"),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });
    render(<Prompt promptId="test-id" />);
    expect(screen.getByText(promptViewModel.name)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.instruction)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.sdlcPhase)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.category)).toBeInTheDocument();
    expect(screen.getByText(promptViewModel.createdBy())).toBeInTheDocument();
  });

  it("renders edit button for owner", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: null,
      promptViewModel: promptViewModel,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("user123", "Test User", false),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container);
    expect(wrapper.findButton('[data-testid="button-edit"]')).toBeTruthy();
  });

  it("does not render edit button for non-owner", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: null,
      promptViewModel: promptViewModel,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("user1234", "Test User"),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container);
    expect(wrapper.findButton('[data-testid="button-edit"]')).toBeFalsy();
  });

  it("does not render edit button for guest user", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: null,
      promptViewModel: promptViewModel,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("user123", "Test User", true),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container);
    expect(wrapper.findButton('[data-testid="button-edit"]')).toBeFalsy();
  });

  it("renders copy button", () => {
    vi.mocked(usePrompt).mockReturnValue({
      loading: false,
      error: null,
      promptViewModel: promptViewModel,
    });
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("user123", "Test User"),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(<Prompt promptId="test-id" />);

    const wrapper = createWrapper(container);
    expect(
      wrapper.findCopyToClipboard('[data-testid="button-copy"]'),
    ).toBeTruthy();
  });
});

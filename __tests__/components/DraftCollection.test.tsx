import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import DraftCollection from "@/components/DraftCollection";
import "@testing-library/jest-dom/vitest";
import createWrapper from "@cloudscape-design/components/test-utils/dom";
import { PromptViewModel } from "@/models/PromptViewModel";
import router from "next/router";
import { useDraftCollection } from "@/hooks/useDraftCollection";

// Mock the dependencies
vi.mock("@/hooks/useDraftCollection");
vi.mock("next/router", () => ({
  default: {
    push: vi.fn(),
  },
}));

describe("DraftCollection component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state", () => {
    vi.mocked(useDraftCollection).mockReturnValue({
      drafts: [],
    });
    const { container } = render(<DraftCollection />);
    const wrapper = createWrapper(container);
    const content = wrapper.findContainer()!.findContent()!.getElement()!;

    expect(content.textContent).contains("No drafts created yet");
    expect(wrapper.findButton('[data-testid="button-create"]')).toBeTruthy();
  });

  it("navigates to create prompt page when 'Create a prompt' button is clicked", () => {
    const { container } = render(<DraftCollection />);
    const wrapper = createWrapper(container);
    const createButton = wrapper.findButton('[data-testid="button-create"]')!;

    fireEvent.click(createButton.getElement());

    expect(router.push).toHaveBeenCalledWith("/prompt/create");
  });

  it("renders drafts", () => {
    vi.mocked(useDraftCollection).mockReturnValue({
      drafts: [new PromptViewModel()],
    });

    const { container } = render(<DraftCollection />);
    const wrapper = createWrapper(container);

    const cards = wrapper.findCards()!;
    const cardItems = cards.findItems()!;

    expect(cards.findItems()).toHaveLength(1);
    expect(cardItems.length).eq(1);
  });
});

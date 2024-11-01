import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import PromptCollection from "@/components/PromptCollection";
import { usePromptCollection } from "@/hooks/usePromptCollection";
import { useAuth } from "@/contexts/AuthContext";
import "@testing-library/jest-dom/vitest";
import createWrapper from "@cloudscape-design/components/test-utils/dom";
import { PromptViewModel } from "@/models/PromptViewModel";

// Mock the hooks
vi.mock("@/hooks/usePromptCollection");
vi.mock("@/contexts/AuthContext");

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
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
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={false} showFilters={false} />,
    );

    const wrapper = createWrapper(container);
    const content = wrapper.findContainer()!.findContent()!.getElement()!;

    expect(content.textContent).toBe("Loading a world of prompts");
  });

  it("renders error state", () => {
    const testError = new Error("Test error");
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: testError,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={false} showFilters={false} />,
    );

    const wrapper = createWrapper(container).findAlert(
      '[data-testid="alert-error"]',
    )!;
    expect(wrapper.findContent().getElement().textContent).toContain(
      "Test error",
    );
  });

  it("renders empty state", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={false} showFilters={false} />,
    );
    const wrapper = createWrapper(container);
    const content = wrapper.findContainer()!.findContent()!.getElement()!;

    expect(content.textContent).contains("No prompts created yet");
    expect(wrapper.findButton('[data-testid="button-create"]')).toBeTruthy();
  });

  it("renders load more button when hasMore is true", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: true,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={false} />,
    );
    const wrapper = createWrapper(container);

    expect(wrapper.findButton('[data-testid="button-load-more"]')).toBeTruthy();
    expect(
      wrapper.findButton('[data-testid="button-load-more"]')!.isDisabled(),
    ).toBeFalsy();
  });

  it("disables load more button when hasMore is false", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={false} />,
    );
    const wrapper = createWrapper(container);

    expect(wrapper.findButton('[data-testid="button-load-more"]')).toBeTruthy();
    expect(
      wrapper.findButton('[data-testid="button-load-more"]')!.isDisabled(),
    ).toBeTruthy();
  });

  it("does not render load more button when showLoadMore is false", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={false} showFilters={false} />,
    );
    const wrapper = createWrapper(container);

    expect(wrapper.findButton('[data-testid="button-load-more"]')).toBeFalsy();
  });

  it("renders filters when showFilters is true", () => {
    const addFilterMock = vi.fn();
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: addFilterMock,
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={true} />,
    );
    const wrapper = createWrapper(container);

    expect(
      wrapper.findTextFilter('[data-testid="textfilter-search"]'),
    ).toBeTruthy();
    expect(wrapper.findSelect('[data-testid="select-sdlc"]')).toBeTruthy();
    expect(wrapper.findSelect('[data-testid="select-category"]')).toBeTruthy();
  });

  it("does not render filters when showFilters is false", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={false} />,
    );
    const wrapper = createWrapper(container);

    expect(
      wrapper.findTextFilter('[data-testid="textfilter-search"]'),
    ).toBeFalsy();
    expect(wrapper.findSelect('[data-testid="select-sdlc"]')).toBeFalsy();
    expect(wrapper.findSelect('[data-testid="select-category"]')).toBeFalsy();
  });

  it("shows clear filter if sdlc filter set", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={true} />,
    );
    const wrapper = createWrapper(container);
    const select = wrapper.findSelect('[data-testid="select-sdlc"]')!;
    select.openDropdown();
    select.selectOptionByValue("Implement");

    expect(
      wrapper.findButton('[data-testid="button-clear-filter"]'),
    ).toBeTruthy();
  });

  it("shows clear filter if category filter set", () => {
    vi.mocked(usePromptCollection).mockReturnValue({
      prompts: [new PromptViewModel()],
      error: null,
      loading: false,
      hasMore: false,
      handleLoadMore: vi.fn(),
      addFilter: vi.fn(),
      resetFilter: vi.fn(),
    });

    const { container } = render(
      <PromptCollection showLoadMore={true} showFilters={true} />,
    );
    const wrapper = createWrapper(container);
    const select = wrapper.findSelect('[data-testid="select-category"]')!;
    select.openDropdown();
    select.selectOptionByValue("Chat");

    expect(
      wrapper.findButton('[data-testid="button-clear-filter"]'),
    ).toBeTruthy();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import createWrapper from "@cloudscape-design/components/test-utils/dom";
import "@testing-library/jest-dom/vitest";
import { PromptViewModel } from "@/models/PromptViewModel";
import { UserViewModel } from "@/models/UserViewModel";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import PromptForm from "@/components/PromptForm";
import { useAuth } from "@/contexts/AuthContext";

// Mock the PromptGraphQLRepository
vi.mock("@/repositories/PromptRepository");
vi.mock("@/contexts/AuthContext");

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("PromptForm component", () => {
  const mockPrompt = new PromptViewModel();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: new UserViewModel("user123", "testuser", false),
      logout: vi.fn(),
      fetchUser: vi.fn(),
    });
  });

  it("renders form fields correctly", () => {
    const { container } = render(<PromptForm prompt={mockPrompt} />);

    const wrapper = createWrapper(container);
    expect(
      wrapper.findFormField('[data-testid="formfield-name"]')!.getElement(),
    ).toBeInTheDocument();
    expect(
      wrapper
        .findFormField('[data-testid="formfield-description"]')!
        .getElement(),
    ).toBeInTheDocument();
    expect(
      wrapper.findFormField('[data-testid="formfield-sdlc"]')!.getElement(),
    ).toBeInTheDocument();
    expect(
      wrapper.findFormField('[data-testid="formfield-category"]')!.getElement(),
    ).toBeInTheDocument();
    expect(
      wrapper
        .findFormField('[data-testid="formfield-instruction"]')!
        .getElement(),
    ).toBeInTheDocument();
  });

  it("updates form data when input changes", () => {
    const { container } = render(<PromptForm prompt={mockPrompt} />);

    const wrapper = createWrapper(container);

    wrapper
      .findInput('[data-testid="input-name"]')!
      .setInputValue("Updated Name");

    const nativeInputName = wrapper
      .findInput('[data-testid="input-name"]')!
      .findNativeInput()
      .getElement();
    expect(nativeInputName.value).toBe("Updated Name");

    wrapper
      .findInput('[data-testid="input-description"]')!
      .setInputValue("Updated Description");

    const nativeInputDescription = wrapper
      .findInput('[data-testid="input-description"]')!
      .findNativeInput()
      .getElement();
    expect(nativeInputDescription.value).toBe("Updated Description");

    wrapper
      .findTextarea('[data-testid="textarea-instruction"]')!
      .setTextareaValue("Updated Instruction");

    const nativeInputInstruction = wrapper
      .findTextarea('[data-testid="textarea-instruction"]')!
      .findNativeTextarea()
      .getElement();
    expect(nativeInputInstruction.value).toBe("Updated Instruction");
  });

  it("calls createPrompt when submitting a new prompt", async () => {
    render(<PromptForm prompt={new PromptViewModel()} />);

    const { container } = render(<PromptForm prompt={mockPrompt} />);

    const wrapper = createWrapper(container);

    wrapper
      .findInput('[data-testid="input-name"]')!
      .setInputValue("Updated Name");
    wrapper
      .findInput('[data-testid="input-description"]')!
      .setInputValue("Updated Description");
    wrapper
      .findTextarea('[data-testid="textarea-instruction"]')!
      .setTextareaValue("Updated Instruction");
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        vi.mocked(PromptGraphQLRepository.prototype.createPrompt),
      ).toHaveBeenCalledTimes(1);
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("calls updatePrompt when submitting an existing prompt", async () => {
    const existingPrompt = PromptViewModel.fromSchema({
      id: "1",
      name: "Test Prompt",
      description: "A test prompt",
      sdlc_phase: "Design",
      category: "Chat",
      instruction: "Test instruction",
      owner_username: "testuser",
      owner: "user123",
      createdAt: "",
      updatedAt: "",
    });
    const { container } = render(<PromptForm prompt={existingPrompt} />);

    const wrapper = createWrapper(container);

    wrapper
      .findInput('[data-testid="input-name"]')!
      .setInputValue("Updated Name");
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        vi.mocked(PromptGraphQLRepository.prototype.updatePrompt),
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          name: "Updated Name",
        }),
      );
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it("navigates back when cancel button is clicked", () => {
    const { container } = render(<PromptForm prompt={mockPrompt} />);
    const wrapper = createWrapper(container);
    wrapper.findButton('[data-testid="button-cancel"]')!.click();

    expect(mockBack).toHaveBeenCalled();
  });

  it("displays validation errors when submitting with empty required fields", async () => {
    const { container } = render(<PromptForm prompt={new PromptViewModel()} />);
    const wrapper = createWrapper(container);

    // Submit without filling required fields
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        wrapper.findFormField('[data-testid="formfield-name"]')!.findError(),
      ).toBeTruthy();
      expect(
        wrapper
          .findFormField('[data-testid="formfield-description"]')!
          .findError(),
      ).toBeTruthy();
      expect(
        wrapper
          .findFormField('[data-testid="formfield-instruction"]')!
          .findError(),
      ).toBeTruthy();
    });

    expect(
      vi.mocked(PromptGraphQLRepository.prototype.createPrompt),
    ).not.toHaveBeenCalled();
  });

  it("displays validation error when name is too short", async () => {
    const { container } = render(<PromptForm prompt={new PromptViewModel()} />);
    const wrapper = createWrapper(container);

    wrapper.findInput('[data-testid="input-name"]')!.setInputValue("ab"); // Less than minimum length
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        wrapper.findFormField('[data-testid="formfield-name"]')!.findError(),
      ).toBeTruthy();
    });
  });

  it("displays validation error when description is too short", async () => {
    const { container } = render(<PromptForm prompt={new PromptViewModel()} />);
    const wrapper = createWrapper(container);

    wrapper.findInput('[data-testid="input-description"]')!.setInputValue("ab"); // Less than minimum length
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        wrapper
          .findFormField('[data-testid="formfield-description"]')!
          .findError(),
      ).toBeTruthy();
    });
  });

  it("displays validation error when instruction is too short", async () => {
    const { container } = render(<PromptForm prompt={new PromptViewModel()} />);
    const wrapper = createWrapper(container);

    wrapper
      .findTextarea('[data-testid="textarea-instruction"]')!
      .setTextareaValue("ab"); // Less than minimum length
    wrapper.findButton('[data-testid="button-save"]')!.click();

    await waitFor(() => {
      expect(
        wrapper
          .findFormField('[data-testid="formfield-instruction"]')!
          .findError(),
      ).toBeTruthy();
    });
  });
});

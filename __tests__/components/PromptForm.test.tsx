import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PromptViewModel } from "@/models/PromptViewModel";
import { UserViewModel } from "@/models/UserViewModel";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import PromptForm from "@/components/PromptForm";

// Mock the PromptGraphQLRepository
vi.mock("@/repositories/PromptRepository");

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("PromptForm component", () => {
  const mockPrompt = new PromptViewModel();

  const mockUser = new UserViewModel("user123", "testuser");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<PromptForm prompt={mockPrompt} user={mockUser} />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Software Development Lifecycle (SDLC) Phase")).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Instruction")).toBeInTheDocument();
  });

  it("updates form data when input changes", () => {
    render(<PromptForm prompt={mockPrompt} user={mockUser} />);

    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });
    expect(nameInput).toHaveValue("Updated Name");

    const descriptionInput = screen.getByLabelText("Description");
    fireEvent.change(descriptionInput, { target: { value: "Updated Description" } });
    expect(descriptionInput).toHaveValue("Updated Description");

    const instructionInput = screen.getByLabelText("Instruction");
    fireEvent.change(instructionInput, { target: { value: "Updated Instruction" } });
    expect(instructionInput).toHaveValue("Updated Instruction");
  });

  it("calls createPrompt when submitting a new prompt", async () => {
    render(<PromptForm prompt={new PromptViewModel()} user={mockUser} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New Prompt" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New Description" } });
    fireEvent.change(screen.getByLabelText("Instruction"), { target: { value: "New Instruction" } });

    fireEvent.click(screen.getByText("Save prompt"));

    await waitFor(() => {
      expect(vi.mocked(PromptGraphQLRepository.prototype.createPrompt)).toHaveBeenCalledTimes(1);
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it("calls updatePrompt when submitting an existing prompt", async () => {
    const existingPrompt = PromptViewModel.fromSchema({
      id: "1",
      name: "Test Prompt",
      description: "A test prompt",
      sdlc_phase: "DESIGN",
      category: "CHAT",
      instruction: "Test instruction",
      owner_username: "testuser",
      owner: "user123",
      createdAt: "",
      updatedAt: "",
    });
    render(<PromptForm prompt={existingPrompt} user={mockUser} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Prompt" } });
    fireEvent.click(screen.getByText("Save prompt"));

    await waitFor(() => {
      expect(vi.mocked(PromptGraphQLRepository.prototype.updatePrompt)).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          name: "Updated Prompt",
        })
      );
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it("navigates back when cancel button is clicked", () => {
    render(<PromptForm prompt={mockPrompt} user={mockUser} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockBack).toHaveBeenCalled();
  });
});

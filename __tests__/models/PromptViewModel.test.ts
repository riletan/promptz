import { describe, expect, it } from "vitest";
import {
  PromptViewModel,
  SdlcPhase,
  PromptCategory,
} from "../../models/PromptViewModel";
import { UserViewModel } from "../../models/UserViewModel";

const schemaPrompt = {
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
};

describe("PromptViewModel", () => {
  it("should create a PromptViewModel instance from a schema object", () => {
    const promptViewModel = PromptViewModel.fromSchema(schemaPrompt);

    expect(promptViewModel.id).toBe(schemaPrompt.id);
    expect(promptViewModel.name).toBe(schemaPrompt.name);
    expect(promptViewModel.description).toBe(schemaPrompt.description);
    expect(promptViewModel.sdlcPhase).toBe(SdlcPhase.DESIGN);
    expect(promptViewModel.category).toBe(PromptCategory.CHAT);
    expect(promptViewModel.instruction).toBe(schemaPrompt.instruction);
  });

  it("should throw an error if the schema object has no owner", () => {
    const schemaPrompt = {
      id: "1",
      name: "Test Prompt",
      description: "A test prompt",
      sdlc_phase: "DESIGN",
      category: "CHAT",
      instruction: "Test instruction",
      owner_username: "testuser",
      createdAt: "",
      updatedAt: "",
    };

    expect(() => PromptViewModel.fromSchema(schemaPrompt)).toThrow(
      "Prompt has no owner",
    );
  });

  it("should return true if the user is the owner of the prompt", () => {
    const user = new UserViewModel("user123", "testuser");
    const promptViewModel = PromptViewModel.fromSchema(schemaPrompt);
    expect(promptViewModel.isOwnedBy(user)).toBe(true);
  });

  it("should return false if the user is not the owner of the prompt", () => {
    const user = new UserViewModel("user456", "testuser");
    const promptViewModel = PromptViewModel.fromSchema(schemaPrompt);

    expect(promptViewModel.isOwnedBy(user)).toBe(false);
  });

  describe("validate", () => {
    it("should return valid result for valid input", () => {
      const promptViewModel = new PromptViewModel();
      promptViewModel.name = "Valid Name";
      promptViewModel.description = "Valid description with enough characters";
      promptViewModel.instruction = "Valid instruction with enough characters";

      const result = promptViewModel.validate();

      expect(result.isValid).toBe(true);
      expect(result.name.isValid).toBe(true);
      expect(result.description.isValid).toBe(true);
      expect(result.instruction.isValid).toBe(true);
    });

    it("should return invalid result for invalid input", () => {
      const promptViewModel = new PromptViewModel();
      promptViewModel.name = "Ab";
      promptViewModel.description = "Too short";
      promptViewModel.instruction = "Too short";

      const result = promptViewModel.validate();

      expect(result.isValid).toBe(false);
      expect(result.name.isValid).toBe(false);
      expect(result.description.isValid).toBe(false);
      expect(result.instruction.isValid).toBe(false);
      expect(result.name.errors[0].value).toContain(
        "between 3 and 100 characters",
      );
      expect(result.description.errors[0].value).toContain(
        "between 10 and 500 characters",
      );
      expect(result.instruction.errors[0].value).toContain(
        "between 10 and 4000 characters",
      );
    });

    it("should return invalid result for empty input", () => {
      const promptViewModel = new PromptViewModel();
      promptViewModel.name = "";
      promptViewModel.description = "";
      promptViewModel.instruction = "";

      const result = promptViewModel.validate();

      expect(result.isValid).toBe(false);
      expect(result.name.isValid).toBe(false);
      expect(result.description.isValid).toBe(false);
      expect(result.instruction.isValid).toBe(false);
      expect(result.name.errors[0].value).toBe("name is required");
      expect(result.description.errors[0].value).toBe(
        "description is required",
      );
      expect(result.instruction.errors[0].value).toBe(
        "instruction is required",
      );
    });
  });
});

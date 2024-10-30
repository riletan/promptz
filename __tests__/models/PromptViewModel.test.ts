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
});

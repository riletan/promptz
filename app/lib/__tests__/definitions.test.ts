import { promptFormSchema, searchParamsSchema } from "@/app/lib/definitions";
import { describe, expect, test } from "@jest/globals";

describe("promptFormSchema Validation", () => {
  const validPrompt = {
    title: "Valid Title",
    description: "This is a valid description for testing",
    instruction:
      "This is a valid instruction that meets the minimum length requirement",
    public: true,
  };

  test("should validate a correct prompt", () => {
    const result = promptFormSchema.safeParse(validPrompt);
    expect(result.success).toBe(true);
  });

  test("should validate optional UUID correctly", () => {
    const promptWithId = {
      ...validPrompt,
      id: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = promptFormSchema.safeParse(promptWithId);
    expect(result.success).toBe(true);
  });

  test("should reject invalid UUID", () => {
    const promptWithInvalidId = {
      ...validPrompt,
      id: "invalid-uuid",
    };
    const result = promptFormSchema.safeParse(promptWithInvalidId);
    expect(result.success).toBe(false);
  });

  test("should validate allowed domains", () => {
    const validUrl = {
      ...validPrompt,
      sourceURL: "https://linkedin.com",
    };
    const invalidUrl = {
      ...validPrompt,
      sourceURL: "https://example.com",
    };

    expect(promptFormSchema.safeParse(validUrl).success).toBe(true);
    expect(promptFormSchema.safeParse(invalidUrl).success).toBe(false);
  });

  test("should validate https", () => {
    const validUrl = {
      ...validPrompt,
      sourceURL: "https://linkedin.com",
    };
    const invalidUrl = {
      ...validPrompt,
      sourceURL: "http://linkedin.com",
    };

    expect(promptFormSchema.safeParse(validUrl).success).toBe(true);
    expect(promptFormSchema.safeParse(invalidUrl).success).toBe(false);
  });

  test("should validate empty sourceURL format", () => {
    const validUrl = {
      ...validPrompt,
      sourceURL: "",
    };

    expect(promptFormSchema.safeParse(validUrl).success).toBe(true);
  });

  test("should validate title length constraints", () => {
    const shortTitle = {
      ...validPrompt,
      title: "ab",
    };
    const longTitle = {
      ...validPrompt,
      title: "a".repeat(101),
    };

    expect(promptFormSchema.safeParse(shortTitle).success).toBe(false);
    expect(promptFormSchema.safeParse(longTitle).success).toBe(false);
  });

  test("should validate description length constraints", () => {
    const shortDesc = {
      ...validPrompt,
      description: "too short",
    };
    const longDesc = {
      ...validPrompt,
      description: "a".repeat(501),
    };

    expect(promptFormSchema.safeParse(shortDesc).success).toBe(false);
    expect(promptFormSchema.safeParse(longDesc).success).toBe(false);
  });

  test("should validate instruction length constraints", () => {
    const shortInstruction = {
      ...validPrompt,
      instruction: "too short",
    };
    const longInstruction = {
      ...validPrompt,
      instruction: "a".repeat(4001),
    };

    expect(promptFormSchema.safeParse(shortInstruction).success).toBe(false);
    expect(promptFormSchema.safeParse(longInstruction).success).toBe(false);
  });
});

describe("searchParamsSchema Validation", () => {
  test("should validate empty search params", () => {
    const result = searchParamsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test("should validate valid search params", () => {
    const validParams = {
      query: "test",
      sort: "asc",
      my: "true",
      interface: "IDE",
      category: "Chat",
      sdlc: "Test",
    };
    const result = searchParamsSchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  test("should validate array values for interface, category, and sdlc", () => {
    const arrayParams = {
      interface: ["IDE", "CLI"],
      category: ["Chat", "Dev Agent"],
      sdlc: ["Test", "Debug"],
    };
    const result = searchParamsSchema.safeParse(arrayParams);
    expect(result.success).toBe(true);
  });
});

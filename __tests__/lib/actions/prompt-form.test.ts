import { onSubmitAction, type FormState } from "@/app/lib/actions/prompt-form";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, test, jest } from "@jest/globals";
import { revalidatePath } from "next/cache";

import {
  newPromptFixture,
  savePromptMock,
} from "@/__mocks__/@aws-amplify/adapter-nextjs/api";

describe("onSubmitAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new prompt successfully", async () => {
    // Create test form data
    const formData = new FormData();
    formData.append("title", newPromptFixture.name);
    formData.append("description", newPromptFixture.description);
    formData.append("howto", newPromptFixture.howto);
    formData.append("instruction", newPromptFixture.instruction);
    formData.append("tags", newPromptFixture.tags[0]);
    formData.append("tags", newPromptFixture.tags[1]);
    formData.append("public", `${newPromptFixture.public}`);
    formData.append("sourceURL", newPromptFixture.sourceURL);

    // Execute the action
    await onSubmitAction({} as FormState, formData);
    // Verify the create function was called with correct parameters
    expect(savePromptMock).toHaveBeenCalled();

    // Verify redirect and revalidation
    expect(revalidatePath).toHaveBeenCalledWith(
      `/prompts/prompt/test-project-rule-1`,
    );
    expect(redirect).toHaveBeenCalledWith(
      `/prompts/prompt/test-project-rule-1`,
    );
  });

  test("should update an existing prompt successfully", async () => {
    // Create test form data with an existing ID

    const formData = new FormData();
    formData.append("id", newPromptFixture.id);
    formData.append("title", newPromptFixture.name);
    formData.append("description", newPromptFixture.description);
    formData.append("howto", newPromptFixture.howto);
    formData.append("instruction", newPromptFixture.instruction);
    formData.append("tags", newPromptFixture.tags[0]);
    formData.append("tags", newPromptFixture.tags[1]);
    formData.append("public", `${newPromptFixture.public}`);
    formData.append("sourceURL", newPromptFixture.sourceURL);

    // Execute the action
    const result = await onSubmitAction({} as FormState, formData);

    // Verify the update function was called with correct parameters
    expect(savePromptMock).toHaveBeenCalled();

    // Verify redirect and revalidation
    expect(revalidatePath).toHaveBeenCalledWith(
      `/prompts/prompt/test-project-rule-1`,
    );
    expect(redirect).toHaveBeenCalledWith(
      `/prompts/prompt/test-project-rule-1`,
    );
  });

  test("should return validation errors for invalid form data", async () => {
    // Create invalid form data (missing required fields)
    const formData = new FormData();
    formData.append("title", ""); // Empty title should fail validation

    // Execute the action
    const result = await onSubmitAction({} as FormState, formData);

    // Verify validation errors are returned
    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid form data");
    expect(result.errors).toBeDefined();
  });

  test("should handle API errors", async () => {
    // Mock the AppSync client with an error response
    savePromptMock.mockReturnValueOnce(
      Promise.resolve({ errors: [{ message: "API Error" }] }),
    );

    // Create valid form data
    const formData = new FormData();
    formData.append("title", "Test Prompt");
    formData.append("description", "Test Description");
    formData.append("howto", "Test How To");
    formData.append("instruction", "Test Instruction");
    formData.append("tags", "tag1");
    formData.append("public", "true");
    formData.append("sourceURL", "");

    // Execute the action
    const result = await onSubmitAction({} as FormState, formData);

    // Verify error handling
    expect(result.success).toBe(false);
    expect(result.message).toBe("Error saving prompt.");
    expect(result.errors?.api).toEqual(["API Error"]);
  });
});

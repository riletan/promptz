import { ModelType } from "@/app/lib/schema-definitions";
import CopyClipBoardButton from "@/app/ui/common/copy-clipboard";
import { beforeEach, describe, expect, test, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";

import {
  publishPromptCopiedMock,
  publishRuleCopiedMock,
} from "@/__mocks__/@aws-amplify/api";

describe("CopyClipBoardButton", () => {
  // Mock the clipboard API
  const mockClipboard = {
    writeText: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Setup clipboard mock
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
    });
  });

  test("renders the button with correct text and icon", () => {
    render(
      <CopyClipBoardButton
        id="1"
        type={ModelType.PROMPT}
        text="test text"
        showButtonText={true}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Copy Prompt");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  test("copies text to clipboard and shows success toast when clicked", async () => {
    const testText = "test text";

    render(
      <CopyClipBoardButton id="1" type={ModelType.PROMPT} text={testText} />,
    );

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(publishPromptCopiedMock).toHaveBeenCalledWith({
      promptId: "1",
    });
    expect(toast).toHaveBeenCalledWith("Copied.", {
      description: "Now, go build.",
    });
  });

  test("counts interaction for project rules", async () => {
    const testText = "test text";

    render(
      <CopyClipBoardButton id="1" type={ModelType.RULE} text={testText} />,
    );

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(publishRuleCopiedMock).toHaveBeenCalledWith({
      ruleId: "1",
    });
  });

  test("shows error toast when clipboard copy fails", async () => {
    mockClipboard.writeText.mockImplementationOnce(() => {
      throw new Error("Clipboard error");
    });

    render(
      <CopyClipBoardButton id="1" type={ModelType.PROMPT} text="test text" />,
    );

    const button = screen.getByRole("button");
    await fireEvent.click(button);

    expect(toast).toHaveBeenCalledWith("Failed to copy", {
      description: "Please try again",
    });
  });
});

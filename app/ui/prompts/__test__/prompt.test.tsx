import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Prompt from "@/app/ui/prompts/prompt";
import {
  getPromptMock,
  mockPrompt,
} from "@/__mocks__/@aws-amplify/adapter-nextjs/api";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Prompt Component", () => {
  test("renders prompt details correctly", async () => {
    render(await Prompt({ promptId: "123" }));

    // Verify basic content rendering
    expect(screen.getByText(mockPrompt.name)).toBeInTheDocument();
    expect(screen.getByText(mockPrompt.description)).toBeInTheDocument();
    expect(screen.getByText(mockPrompt.howto)).toBeInTheDocument();
    expect(screen.getByText(mockPrompt.sourceURL)).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();

    // Verify author is rendered
    expect(
      screen.getByText(`@${mockPrompt.owner_username}`),
    ).toBeInTheDocument();

    // Verify tags are rendered
    mockPrompt.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  test("renders prompt without sourceurl correctly", async () => {
    const mockPromptWithoutSourceUrl = { ...mockPrompt };
    mockPromptWithoutSourceUrl.sourceURL = "";

    getPromptMock.mockReturnValueOnce(
      Promise.resolve({ data: mockPromptWithoutSourceUrl }),
    );

    render(await Prompt({ promptId: "123" }));

    // Verify basic content rendering
    expect(screen.queryByText(mockPrompt.sourceURL)).not.toBeInTheDocument();
  });

  test("renders private badge", async () => {
    const privateMockPrompt = { ...mockPrompt };
    privateMockPrompt.public = false;

    getPromptMock.mockReturnValueOnce(
      Promise.resolve({ data: privateMockPrompt }),
    );

    render(await Prompt({ promptId: "123" }));

    // Verify basic content rendering
    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});

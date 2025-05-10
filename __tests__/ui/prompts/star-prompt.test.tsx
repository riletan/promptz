import { beforeEach, describe, expect, jest, it } from "@jest/globals";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StarPromptButton from "@/app/ui/prompts/star-prompt";
import { User } from "@/app/lib/definitions";
import { Prompt } from "@/app/lib/prompt-model";

import { useRouterPush } from "@/__mocks__/next/navigation";
import {
  createStarMock,
  deleteStarMock,
  publishPromptStarredMock,
  publishPromptUnstarredMock,
} from "@/__mocks__/@aws-amplify/api";
import { toast } from "sonner";

describe("StarPromptButton", () => {
  const mockPrompt: Prompt = {
    id: "test-prompt-id",
    title: "Test Prompt",
  };

  const mockUser: User = {
    id: "test-user-id",
    guest: false,
    username: "",
    displayName: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with unstarred state", () => {
    render(
      <StarPromptButton prompt={mockPrompt} user={mockUser} starred={false} />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveClass("bg-violet-700");
  });

  it("renders correctly with starred state", () => {
    render(
      <StarPromptButton prompt={mockPrompt} user={mockUser} starred={true} />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass("bg-violet-700");
  });

  it("redirects to login page when guest user clicks", async () => {
    const guestUser = { ...mockUser, guest: true };

    render(
      <StarPromptButton prompt={mockPrompt} user={guestUser} starred={false} />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(useRouterPush).toHaveBeenCalledWith("/login");
  });

  it("creates a star when unstarred prompt is clicked", async () => {
    render(
      <StarPromptButton prompt={mockPrompt} user={mockUser} starred={false} />,
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(createStarMock).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          promptId: mockPrompt.id,
        },
        {
          authMode: "userPool",
        },
      );
      expect(publishPromptStarredMock).toHaveBeenCalledWith({
        promptId: mockPrompt.id,
      });
      expect(toast).toHaveBeenCalledWith("Prompt added to your favorites");
    });
  });

  it("deletes a star when starred prompt is clicked", async () => {
    render(
      <StarPromptButton prompt={mockPrompt} user={mockUser} starred={true} />,
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(deleteStarMock).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          promptId: mockPrompt.id,
        },
        {
          authMode: "userPool",
        },
      );
      expect(publishPromptUnstarredMock).toHaveBeenCalledWith({
        promptId: mockPrompt.id,
      });
      expect(toast).toHaveBeenCalledWith("Prompt removed from your favorites");
    });
  });
});

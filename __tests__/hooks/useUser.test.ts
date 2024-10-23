import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUser } from "../../hooks/useUser";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { UserViewModel } from "@/models/UserViewModel";

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
}));

describe("Test useUser hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user data on mount", async () => {
    const mockUser = { userId: "testUserId" };
    (getCurrentUser as Mock).mockResolvedValue(mockUser);
    (fetchUserAttributes as Mock).mockResolvedValue({ preferred_username: "test" });

    const { result } = renderHook(() => useUser());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.userViewModel).toEqual(new UserViewModel("testUserId", "test"));
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle error when fetching user data fails", async () => {
    const error = new Error("Failed to fetch user");
    (getCurrentUser as Mock).mockRejectedValue(error);
    (fetchUserAttributes as Mock).mockResolvedValue({ preferred_username: "test" });

    const { result } = renderHook(() => useUser());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.userViewModel).toBe(null);
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});

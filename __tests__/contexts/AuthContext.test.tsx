import { describe, it, expect, vi } from "vitest";
import { render, act, RenderResult } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { getCurrentUser, fetchUserAttributes, signOut } from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
  signOut: vi.fn(),
}));

describe("AuthContext", () => {
  it("should initialize with null user", () => {
    const TestComponent = () => {
      const { user } = useAuth();
      return <div>{user ? user.userName : "No user"}</div>;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(getByText("No user")).toBeTruthy();
  });

  it("should fetch user on mount", async () => {
    vi.mocked(fetchUserAttributes).mockResolvedValue({
      sub: "1",
      preferred_username: "testUser",
    });

    const TestComponent = () => {
      const { user } = useAuth();
      return <div>{user ? user.userName : "No user"}</div>;
    };

    let renderResult;
    await act(async () => {
      renderResult = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(renderResult!.getByText("testUser")).toBeTruthy();
  });

  it("should set guest user when fetch fails", async () => {
    vi.mocked(fetchUserAttributes).mockRejectedValue(new Error("Fetch failed"));

    const TestComponent = () => {
      const { user } = useAuth();
      return <div>{user ? user.userName : "No user"}</div>;
    };

    let renderResult;
    await act(async () => {
      renderResult = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(renderResult!.getByText("guest")).toBeTruthy();
  });

  it("should logout user", async () => {
    vi.mocked(fetchUserAttributes).mockResolvedValue({
      sub: "1",
      preferred_username: "testUser",
    });

    const TestComponent = () => {
      const { user, logout } = useAuth();
      return (
        <div>
          <span>{user ? user.userName : "No user"}</span>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    let renderResult: RenderResult;
    await act(async () => {
      renderResult = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    await act(async () => {
      renderResult.getByText("Logout").click();
    });

    expect(renderResult!.getByText("guest")).toBeTruthy();
    expect(signOut).toHaveBeenCalled();
  });

  it("should throw error when useAuth is used outside of AuthProvider", () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});

import { describe, expect, test, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import MyRules from "@/app/rules/my/page";

// Mock the project rules action
jest.mock("@/app/lib/actions/project-rules", () => ({
  searchProjectRules: jest.fn(),
}));

describe("MyRules Page", () => {
  test("renders the page with correct title and description", async () => {
    // Render the component
    render(await MyRules());

    // Check if the title and description are rendered
    expect(screen.getByText("My Rules")).toBeInTheDocument();
    expect(
      screen.getByText("Manage and refine your project rules."),
    ).toBeInTheDocument();
  });

  test("renders the create button", async () => {
    // Render the component
    render(await MyRules());

    // Check if the create button is rendered
    expect(screen.getByText("Create Rule")).toBeInTheDocument();
  });
});

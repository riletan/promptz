import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import HomeHeader from "@/components/HomeHeader/HomeHeader";

// Mock next/navigation
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("HomeHeader", () => {
  it("renders the header texts", () => {
    const { getByText } = render(<HomeHeader />);
    expect(
      getByText("Simplify prompting for Amazon Q Developer"),
    ).toBeDefined();
    expect(
      getByText("The perfect prompt is just one click away!"),
    ).toBeDefined();
  });
});

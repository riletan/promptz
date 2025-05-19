import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  jest,
} from "@jest/globals";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchBox from "@/app/ui/common/search";
import { useRouter, useRouterReplace } from "@/__mocks__/next/navigation";

describe("SearchBox", () => {
  // Setup common mocks
  const mockPathname = "/test-path";

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("debounces search input to avoid excessive URL updates", async () => {
    // Render the component
    render(<SearchBox placeholder="Search..." />);

    // Get the search input
    const searchInput = screen.getByPlaceholderText("Search...");

    // Type multiple characters in quick succession
    fireEvent.change(searchInput, { target: { value: "t" } });
    fireEvent.change(searchInput, { target: { value: "te" } });
    fireEvent.change(searchInput, { target: { value: "tes" } });
    fireEvent.change(searchInput, { target: { value: "test" } });

    // Verify that router.replace hasn't been called yet (debounce in effect)
    expect(useRouterReplace).not.toHaveBeenCalled();

    // Fast-forward time to trigger the debounced function
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now router.replace should have been called exactly once with the final value
    expect(useRouterReplace).toHaveBeenCalledTimes(1);
  });
});

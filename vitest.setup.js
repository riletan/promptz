import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { configure, cleanup } from "@testing-library/react";

beforeEach(() => {
  vi.spyOn(console, "error");
  // @ts-expect-error jest.spyOn adds this functionallity
  console.error.mockImplementation(() => null);
});

afterEach(() => {
  console.error.mockRestore();
  cleanup();
});

configure({
  testIdAttribute: "data-testid",
});

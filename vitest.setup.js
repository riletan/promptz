import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { configure, cleanup } from "@testing-library/react";

beforeEach(() => {
  vi.spyOn(console, "error");
  // @ts-ignore jest.spyOn adds this functionallity
  console.error.mockImplementation(() => null);
});

afterEach(() => {
  console.error.mockRestore();
  cleanup();
});

configure({
  testIdAttribute: "data-testing",
});

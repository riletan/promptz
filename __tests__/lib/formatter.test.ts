import { describe, expect, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { slugify } from "@/app/lib/formatter";

describe("slugify", () => {
  test("should convert string to lowercase", () => {
    expect(slugify("HELLO WORLD")).toBe("hello-world");
  });

  test("should replace spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  test("should remove special characters", () => {
    expect(slugify("hello! @world#")).toBe("hello-world");
  });

  test("should handle multiple spaces", () => {
    expect(slugify("hello    world")).toBe("hello-world");
  });

  test("should remove leading and trailing spaces", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  test("should handle numbers", () => {
    expect(slugify("hello world 123")).toBe("hello-world-123");
  });

  test("should remove multiple consecutive hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  test("should remove leading and trailing hyphens", () => {
    expect(slugify("-hello-world-")).toBe("hello-world");
  });

  test("should handle unicode characters", () => {
    expect(slugify("héllö wörld")).toBe("hello-world");
  });

  test("should handle empty string", () => {
    expect(slugify("")).toBe("");
  });

  test("should handle string with only special characters", () => {
    expect(slugify("!@#$%^&*()")).toBe("");
  });

  test("should handle numbers as input", () => {
    expect(slugify("123")).toBe("123");
  });
});

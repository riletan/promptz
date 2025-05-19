import { normalizeTags } from "@/app/lib/filters";
import { describe, expect, test } from "@jest/globals";

describe("normalize string tags", () => {
  test("should create filter condition for a single tag string", () => {
    const tag = "javascript";
    const filter = normalizeTags(tag);

    expect(filter).toEqual(["javascript"]);
  });

  test("should create filter conditions for multiple tags", () => {
    const tags = ["javascript", "typescript"];
    const filter = normalizeTags(tags);

    expect(filter).toEqual(["javascript", "typescript"]);
  });

  test("should handle empty tag array", () => {
    const filter = normalizeTags([]);

    expect(filter).toEqual([]);
  });

  test("should handle empty tag string", () => {
    const filter = normalizeTags("");

    expect(filter).toEqual([""]);
  });
});
